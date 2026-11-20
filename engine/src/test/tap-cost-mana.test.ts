// The auto-payer and mana abilities that tap other permanents as their cost
// (`Game.tapCostManaSources`): Relic of Legends' "Tap an untapped legendary
// creature you control: Add one mana of any color", Springleaf Drum's "{T},
// Tap an untapped creature you control", Heritage Druid's three Elves. A bug
// report, 2026-11-20: with Relic of Legends' only mana in a legend, a spell it
// paid for wasn't offered, so the window read as mana-only and was passed.
import { describe, expect, it } from "vitest";

import { A, cast, ref, spawn, table, toHand, toStep, B } from "./harness.js";

const offered = (game: ReturnType<typeof table>["game"], card: string): boolean =>
  game.legalActions(A).some((o) => o.kind === "cast-spell" && game.state.objects[o.card]?.zone === "hand" &&
    game.state.objects[o.card].cardName === card);

describe("mana abilities that tap other permanents, in a payment", () => {
  it("Relic of Legends: a legend's tap pays for an instant, and the window isn't mana-only", () => {
    const { game } = table({ step: "end" });
    spawn(game, "Relic of Legends", A, { tapped: true });
    const legend = spawn(game, "Thrasios, Triton Hero");
    const bolt = toHand(game, "Lightning Bolt");
    expect(offered(game, "Lightning Bolt")).toBe(true);
    expect(game.isDeadForMana(A)).toBe(false);
    cast(game, bolt, { targets: [ref(B)] });
    expect(game.state.objects[legend].tapped).toBe(true);
    expect(game.state.players[B].life).toBe(17);
  });

  it("Relic of Legends: its own {T} and a legend's tap pay two", () => {
    const { game } = table();
    const relic = spawn(game, "Relic of Legends");
    const legend = spawn(game, "Thrasios, Triton Hero");
    const card = toHand(game, "Think Twice");
    expect(offered(game, "Think Twice")).toBe(true);
    cast(game, card);
    expect(game.state.objects[relic].tapped).toBe(true);
    expect(game.state.objects[legend].tapped).toBe(true);
  });

  it("two Relics share one legend: one mana, not two", () => {
    const { game } = table();
    spawn(game, "Relic of Legends", A, { tapped: true });
    spawn(game, "Relic of Legends", A, { tapped: true });
    spawn(game, "Thrasios, Triton Hero");
    toHand(game, "Think Twice");
    expect(offered(game, "Think Twice")).toBe(false);
  });

  it("Springleaf Drum taps a summoning-sick creature (rule 302.6) along with itself", () => {
    const { game } = table();
    const drum = spawn(game, "Springleaf Drum");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(game.state.objects[drum].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("a creature that taps for its own mana isn't also the Drum's: one mana in all", () => {
    const { game } = table();
    spawn(game, "Springleaf Drum");
    spawn(game, "Llanowar Elves");
    toHand(game, "Grizzly Bears");
    expect(offered(game, "Grizzly Bears")).toBe(false);
  });

  it("Heritage Druid taps three Elves cast this turn for {G}{G}{G}", () => {
    const { game } = table();
    const elves = [0, 1, 2].map(() => spawn(game, "Llanowar Elves", A, { sick: true }));
    spawn(game, "Heritage Druid", A, { sick: true });
    const courser = toHand(game, "Centaur Courser");
    expect(offered(game, "Centaur Courser")).toBe(true);
    cast(game, courser);
    expect(game.state.objects[courser].zone).toBe("battlefield");
    // Druid is an Elf too: three of the four are tapped.
    const tapped = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped);
    expect(tapped.length).toBe(3);
    expect(elves.length).toBe(3);
  });

  it("the window outside a main phase stays open once there's a spell to cast", () => {
    const { game } = table();
    toStep(game, "end");
    spawn(game, "Relic of Legends", A, { tapped: true });
    spawn(game, "Thrasios, Triton Hero");
    expect(game.isDeadForMana(A)).toBe(true);
    toHand(game, "Lightning Bolt");
    expect(game.isDeadForMana(A)).toBe(false);
  });
});
