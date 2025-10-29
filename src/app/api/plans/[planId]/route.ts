import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== "BOAT_OWNER") {
      return NextResponse.json({ error: "オーナー権限が必要です" }, { status: 403 });
    }

    const body = await request.json();
    const { planId } = params;

    // プランの存在確認と所有者チェック
    const existingPlan = await prisma.fishingPlan.findUnique({
      where: { id: planId },
      include: { boat: true },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "プランが見つかりません" }, { status: 404 });
    }

    if (existingPlan.boat.ownerId !== decoded.userId) {
      return NextResponse.json({ error: "このプランを編集する権限がありません" }, { status: 403 });
    }

    // プラン更新
    const updatedPlan = await prisma.fishingPlan.update({
      where: { id: planId },
      data: {
        title: body.title,
        date: body.date ? new Date(body.date) : undefined,
        price: body.price,
        fishType: Array.isArray(body.fishTypes) ? body.fishTypes.join(", ") : body.fishType || "",
        description: body.description,
        duration: body.duration,
        maxPeople: body.maxCapacity || body.maxPeople,
      },
      include: {
        boat: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json(
      { error: "プランの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== "BOAT_OWNER") {
      return NextResponse.json({ error: "オーナー権限が必要です" }, { status: 403 });
    }

    const { planId } = params;

    // プランの存在確認と所有者チェック
    const existingPlan = await prisma.fishingPlan.findUnique({
      where: { id: planId },
      include: { boat: true },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "プランが見つかりません" }, { status: 404 });
    }

    if (existingPlan.boat.ownerId !== decoded.userId) {
      return NextResponse.json({ error: "このプランを削除する権限がありません" }, { status: 403 });
    }

    // 関連する予約があるか確認
    const relatedBookings = await prisma.booking.findMany({
      where: {
        planId: planId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (relatedBookings.length > 0) {
      return NextResponse.json(
        { error: "このプランには予約が入っているため削除できません" },
        { status: 400 }
      );
    }

    // プラン削除
    await prisma.fishingPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({ message: "プランを削除しました" });
  } catch (error) {
    console.error("Plan delete error:", error);
    return NextResponse.json(
      { error: "プランの削除に失敗しました" },
      { status: 500 }
    );
  }
}
