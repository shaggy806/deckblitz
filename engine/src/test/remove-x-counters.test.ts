/**
 * "Remove X counters" / "remove any number of counters" as a cost
 * (`removeCounter`'s `count: "x"` — X announced as the ability is activated,
 * rules 601.2b and 602.2b, up to the counters on the source, 0 allowed):
 * Fallen Empires' storage lands, which also keep their counters by staying
 * tapped (rule 502.3) and gain one in each upkeep they start tapped (an
 * intervening if, 603.4).
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { A, B, activate, counters, life, nextTurn, pickPermanents, ref, spawn, table, toGraveyard, zone } from "./harness.js";

const pool = (game: ReturnType<typeof table>["game"]): string[] =>
  game.state.players[A].manaPool.map((u) => u.type);

describe("storage lands", () => {
  it("gain a storage counter each upkeep they start tapped, and keep them tapped", () => {
    const { game, a } = table();
    const vault = spawn(game, "Bottomless Vault", A, { tapped: true });
    pickPermanents(a, vault);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[vault].tapped).toBe(true);
    expect(counters(game, vault, "storage")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, vault, "storage")).toBe(2);
  });

  it("gain nothing in an upkeep they start untapped", () => {
    const { game, a } = table();
    const vault = spawn(game, "Bottomless Vault", A, { tapped: true });
    pickPermanents(a);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[vault].tapped).toBe(false);
    expect(counters(game, vault, "storage")).toBe(0);
  });

  it("make one mana for each counter removed, X chosen up to what it has", () => {
    const { game } = table();
    const silos = spawn(game, "Sand Silos");
    game.state.objects[silos].tapped = false;
    game.state.objects[silos].counters.storage = 3;
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === silos);
    expect(offer?.kind === "activate-ability" ? offer.xCost?.maxX : undefined).toBe(3);
    activate(game, silos, 0, { x: 2, settle: false });
    expect(pool(game)).toEqual(["U", "U"]);
    expect(counters(game, silos, "storage")).toBe(1);
    expect(game.state.objects[silos].tapped).toBe(true);
  });

  it("can remove none, and can't remove more than it has", () => {
    const { game } = table();
    const store = spawn(game, "Icatian Store");
    game.state.objects[store].tapped = false;
    game.state.objects[store].counters.storage = 1;
    const tooMany: Action = { type: "activate-ability", player: A, source: store, abilityIndex: 0, targets: [], xValue: 2 };
    expect(() => game.dispatch(tooMany)).toThrow();
    activate(game, store, 0, { x: 0, settle: false });
    expect(pool(game)).toEqual([]);
    expect(counters(game, store, "storage")).toBe(1);
    expect(game.state.objects[store].tapped).toBe(true);
  });
});

describe("remove X counters elsewhere", () => {
  it("Blue Mana Battery: {U} and one more {U} per counter removed, even with none", () => {
    const { game } = table();
    const battery = spawn(game, "Blue Mana Battery");
    game.state.objects[battery].counters.charge = 2;
    activate(game, battery, 1, { x: 2, settle: false });
    expect(pool(game)).toEqual(["U", "U", "U"]);
    expect(counters(game, battery, "charge")).toBe(0);
  });

  it("Chamber Sentry: one X pays both the mana and the counters, capped by each", () => {
    const { game } = table();
    const sentry = spawn(game, "Chamber Sentry");
    game.state.objects[sentry].counters["+1/+1"] = 3;
    for (let i = 0; i < 2; i++) spawn(game, "Wastes");
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === sentry && o.abilityIndex === 0);
    expect(offer?.kind === "activate-ability" ? offer.xCost?.maxX : undefined).toBe(2);
    activate(game, sentry, 0, { x: 2, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(counters(game, sentry)).toBe(1);
  });

  it("Rasputin: 'one or more' refuses X = 0", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin, the Oneiromancer");
    game.state.objects[rasputin].counters.dream = 2;
    const none: Action = { type: "activate-ability", player: A, source: rasputin, abilityIndex: 0, targets: [], xValue: 0 };
    expect(() => game.dispatch(none)).toThrow();
    activate(game, rasputin, 0, { x: 2, settle: false });
    expect(pool(game)).toEqual(["C", "C"]);
  });

  it("Haruspex: X mana of one colour", () => {
    const { game } = table();
    const haruspex = spawn(game, "Haruspex");
    game.state.objects[haruspex].counters["+1/+1"] = 3;
    game.dispatch({ type: "activate-ability", player: A, source: haruspex, abilityIndex: 0, targets: [], xValue: 3, manaColors: ["G"] } as Action);
    expect(pool(game)).toEqual(["G", "G", "G"]);
    expect(counters(game, haruspex)).toBe(0);
  });

  it("Hourglass of the Lost: returns each nonland permanent card with mana value X", () => {
    const { game } = table();
    const glass = spawn(game, "Hourglass of the Lost");
    game.state.objects[glass].counters.time = 2;
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, glass, 1, { x: 2 });
    expect(zone(game, glass)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
