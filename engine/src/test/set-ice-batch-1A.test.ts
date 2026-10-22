/**
 * Ice Age (ICE), group A: the clauses most likely to be wrong on each card.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

/** The activate-ability actions offered to `player` on `id` whose text starts with `prefix`. */
const offered = (game: Game, player: PlayerId, id: ObjectId, prefix: string) =>
  game
    .legalActions(player)
    .filter((action) => action.kind === "activate-ability" && action.source === id && action.text.startsWith(prefix));

describe("Abyssal Specter", () => {
  it("makes the player it damages discard a card", () => {
    const { game, a } = table();
    const specter = spawn(game, "Abyssal Specter");
    const before = hand(game, B).length;
    attack(game, a, [specter]);
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Snow Devil", () => {
  const blockWith = (snow: boolean) => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, snow ? "Snow-Covered Forest" : "Forest");
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Snow Devil"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder !== null && s.awaiting === null);
    return keywords(game, bears).has("first-strike");
  };

  it("gives first strike while blocking with a snow land", () => {
    expect(blockWith(true)).toBe(true);
  });

  it("gives no first strike while blocking without a snow land", () => {
    expect(blockWith(false)).toBe(false);
  });
});

describe("Seizures", () => {
  it("deals 3 to the creature's controller when it becomes tapped, unless they pay {3}", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Seizures"), { targets: [ref(bears)] });
    pickModes(b);
    cast(game, toHand(game, "Pressure Point"), { targets: [ref(bears)] });
    expect(tapped(game, bears)).toBe(true);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("deals nothing when that player pays", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3, B);
    lands(game, "Swamp", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Seizures"), { targets: [ref(bears)] });
    pickModes(b, 0);
    cast(game, toHand(game, "Pressure Point"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(20);
  });
});

describe("Touch of Vitae", () => {
  it("grants haste and a once-only {0} untap, and draws at the next upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Touch of Vitae"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("haste")).toBe(true);
    const [untap] = offered(game, A, bears, "{0}: Untap");
    if (untap?.kind !== "activate-ability") throw new Error("not offered");
    activate(game, bears, untap.abilityIndex);
    expect(tapped(game, bears)).toBe(false);
    game.state.objects[bears].tapped = true;
    expect(offered(game, A, bears, "{0}: Untap")).toEqual([]);
    const before = hand(game, A).length;
    nextTurn(game);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Phantasmal Mount", () => {
  it("pumps a small creature, which is sacrificed when the Mount leaves", () => {
    const { game } = table();
    const mount = spawn(game, "Phantasmal Mount");
    const lions = spawn(game, "Savannah Lions");
    activate(game, mount, 0, { targets: [ref(lions)] });
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, lions).has("flying")).toBe(true);
    destroy(game, mount);
    expect(zone(game, lions)).toBe("graveyard");
  });

  it("is sacrificed when the creature leaves", () => {
    const { game } = table();
    const mount = spawn(game, "Phantasmal Mount");
    const lions = spawn(game, "Savannah Lions");
    activate(game, mount, 0, { targets: [ref(lions)] });
    destroy(game, lions);
    expect(zone(game, mount)).toBe("graveyard");
  });
});

describe("Binding Grasp", () => {
  it("steals the creature, +0/+1, until you stop paying {1}{U}", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Binding Grasp"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Land Cap", () => {
  it("stays tapped through an untap step with a depletion counter, which the upkeep removes", () => {
    const { game } = table();
    const cap = spawn(game, "Land Cap");
    activate(game, cap, 0);
    expect(counters(game, cap, "depletion")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, cap)).toBe(true);
    expect(counters(game, cap, "depletion")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, cap)).toBe(false);
  });
});

describe("Iceberg", () => {
  it("enters with X ice counters and removes one for {C}", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Iceberg"), { x: 2 });
    const [iceberg] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Iceberg");
    expect(counters(game, iceberg, "ice")).toBe(2);
    activate(game, iceberg, 1);
    expect(counters(game, iceberg, "ice")).toBe(1);
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["C"]);
  });
});

describe("Mind Whip", () => {
  it("at its controller's upkeep, 2 damage and a tap unless they pay {3}", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Mind Whip"), { targets: [ref(bears)] });
    pickModes(b);
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(tapped(game, bears)).toBe(true);
    // Alice's own upkeep doesn't trigger it.
    nextTurn(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("Nacre Talisman", () => {
  it("may pay {3} to untap a permanent when a white spell is cast", () => {
    const { game, a } = table();
    spawn(game, "Nacre Talisman");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Island", 3);
    lands(game, "Plains", 1);
    pickModes(a, 0);
    pickTargets(a, bears);
    cast(game, toHand(game, "Savannah Lions"));
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Fylgja", () => {
  it("enters with four healing counters, each preventing 1 damage to the creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Fylgja"), { targets: [ref(bears)] });
    const [fylgja] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Fylgja");
    expect(counters(game, fylgja, "healing")).toBe(4);
    activate(game, fylgja, 0);
    expect(counters(game, fylgja, "healing")).toBe(3);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Vibrating Sphere", () => {
  it("+2/+0 on your turn, -0/-2 on others'", () => {
    const { game } = table();
    spawn(game, "Vibrating Sphere");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
