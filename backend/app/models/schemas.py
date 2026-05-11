"""Poker Coach - Pydantic 数据模型"""

from __future__ import annotations

from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    """Monte Carlo 模拟请求"""
    hand: list[str] = Field(
        ..., min_length=2, max_length=2,
        description="自己的两张手牌，如 ['Ah', 'Kd']"
    )
    board: list[str] = Field(
        default_factory=list, max_length=5,
        description="公共牌，0-5 张"
    )
    opponent_count: int = Field(
        default=1, ge=1, le=9,
        description="对手数量 (1-9)"
    )
    num_simulations: int = Field(
        default=10000, ge=100, le=1000000,
        description="模拟次数"
    )


class SimulateResult(BaseModel):
    """单次模拟结果"""
    win_rate: float = Field(..., description="胜率 (0-1)")
    tie_rate: float = Field(..., description="平局率 (0-1)")
    loss_rate: float = Field(..., description="败率 (0-1)")
    expected_value: float = Field(..., description="期望价值 (EV)，以底池的百分比表示")
    num_simulations: int = Field(..., description="实际模拟次数")
    best_hand_rank: str | None = Field(None, description="最佳牌型名称")
    best_hand_cards: list[str] | None = Field(None, description="最佳成牌的五张牌")


class SimulateResponse(BaseModel):
    """Monte Carlo 模拟响应"""
    hand: list[str]
    board: list[str]
    opponent_count: int
    result: SimulateResult


class CompareStrategy(BaseModel):
    """对比策略 — 不同的手牌/弃牌决策"""
    name: str = Field(..., description="策略名称")
    hand: list[str] = Field(
        ..., min_length=2, max_length=2,
        description="该策略下的手牌"
    )


class CompareRequest(BaseModel):
    """对比两种打法的请求"""
    strategies: list[CompareStrategy] = Field(
        ..., min_length=2, max_length=2,
        description="两种策略，每种包含名称和手牌"
    )
    board: list[str] = Field(
        default_factory=list, max_length=5,
        description="公共牌"
    )
    opponent_count: int = Field(default=1, ge=1, le=9)
    num_simulations: int = Field(default=10000, ge=100, le=1000000)


class CompareResult(BaseModel):
    """单种策略的对比结果"""
    name: str
    hand: list[str]
    win_rate: float
    tie_rate: float
    loss_rate: float
    expected_value: float


class CompareResponse(BaseModel):
    """两种策略的对比结果"""
    board: list[str]
    opponent_count: int
    num_simulations: int
    strategies: list[CompareResult]
    recommendation: str = Field(..., description="推荐策略：EV 更高的策略名")


class HandInfo(BaseModel):
    """手牌信息"""
    rank_name: str = Field(..., description="牌型名称（如 '一对', '同花'）")
    cards: list[str] = Field(..., description="组成该牌型的五张牌")
