/**
 * Saviors of Kamigawa, group A: the Kirin and the other "Spirit or Arcane"
 * cast triggers, Sekki's damage replacement, Maga, Footsteps of the Goryo,
 * Inner Fire and soulshift.
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Inner Fire", () => {
  it("adds {R} for each card in your hand as it resolves", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const fire = toHand(game, "Inner Fire");
    cast(game, fire);
    const inHand = hand(game, A).length;
    expect(inHand).toBeGreaterThan(0);
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(inHand);
  });
});

describe("Sekki, Seasons' Guide", () => {
  it("prevents damage, removes that many counters and makes that many Spirits", () => {
    const { game } = table();
    const sekki = enter(game, "Sekki, Seasons' Guide");
    expect(counters(game, sekki)).toBe(8);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "object", object: sekki }] });
    expect(counters(game, sekki)).toBe(5);
    expect(game.state.objects[sekki].damageMarked).toBe(0);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(3);
  });

  it("makes every token even with fewer counters than the damage", () => {
    const { game } = table();
    const sekki = enter(game, "Sekki, Seasons' Guide");
    game.state.objects[sekki].counters["+1/+1"] = 1;
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "object", object: sekki }] });
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(3);
    expect(zone(game, sekki)).toBe("graveyard");
  });

  it("returns from the graveyard by sacrificing eight Spirits", () => {
    const { game } = table();
    const sekki = toGraveyard(game, "Sekki, Seasons' Guide");
    const spirits = Array.from({ length: 8 }, () => spawn(game, "Child of Thorns"));
    activate(game, sekki, 0);
    expect(zone(game, sekki)).toBe("battlefield");
    expect(counters(game, sekki)).toBe(8);
    expect(spirits.every((s) => zone(game, s) === "graveyard")).toBe(true);
  });
});

describe("Maga, Traitor to Mortals", () => {
  it("enters with X counters and the target player loses that much", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    pickTargets(a, B);
    const maga = toHand(game, "Maga, Traitor to Mortals");
    cast(game, maga, { x: 3 });
    expect(counters(game, maga)).toBe(3);
    expect(life(game, B)).toBe(17);
  });
});

describe("Footsteps of the Goryo", () => {
  it("returns a creature card, then sacrifices it at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Footsteps of the Goryo"), { targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "cleanup");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Spirit or Arcane cast triggers", () => {
  it("Skyfire Kirin offers only creatures with the spell's mana value, and takes one", () => {
    const { game, a } = table();
    spawn(game, "Skyfire Kirin");
    const elves = spawn(game, "Llanowar Elves", B);
    const otherElves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    const seen = watchTargets(a, () => [elves]);
    pickModes(a, 0);
    cast(game, toHand(game, "Child of Thorns"));
    expect(seen.offered[0]).toEqual(expect.arrayContaining([elves, otherElves]));
    expect(seen.offered[0]).not.toContain(bears);
    expect(controller(game, elves)).toBe(A);
  });

  it("Skyfire Kirin ignores a spell that's neither Spirit nor Arcane", () => {
    const { game, a } = table();
    spawn(game, "Skyfire Kirin");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    const seen = watchTargets(a);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(seen.asked).toBe(0);
  });

  it("Cloudhoof Kirin mills the target player the Arcane spell's mana value", () => {
    const { game, a } = table();
    spawn(game, "Cloudhoof Kirin");
    const victim = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    pickModes(a, 0);
    a.chooseTargetsFn = (_v, source) => (source === "Cloudhoof Kirin" ? [{ kind: "player", player: B }] : []);
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Eye of Nowhere"), { targets: [{ kind: "object", object: victim }] });
    expect(graveyard(game, B).length - before).toBe(2);
  });

  it("Dreamcatcher may be sacrificed to draw a card", () => {
    const { game, a } = table();
    const catcher = spawn(game, "Dreamcatcher");
    lands(game, "Forest", 1);
    pickModes(a, 0);
    const thorns = toHand(game, "Child of Thorns");
    const before = hand(game, A).length;
    cast(game, thorns);
    expect(zone(game, catcher)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before); // one cast, one drawn
  });

  it("Kiri-Onna may return itself to hand", () => {
    const { game, a } = table();
    const onna = spawn(game, "Kiri-Onna");
    lands(game, "Forest", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Child of Thorns"));
    expect(zone(game, onna)).toBe("hand");
  });

  it("Elder Pine of Jukai puts the revealed lands into hand and the rest on the bottom", () => {
    const { game } = table();
    spawn(game, "Elder Pine of Jukai");
    lands(game, "Forest", 1);
    const b1 = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const b2 = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Child of Thorns"));
    expect(zone(game, forest)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2)).toEqual(expect.arrayContaining([b1, b2]));
  });
});

describe("Soulshift", () => {
  it("Promised Kannushi returns a Spirit card with mana value 7 or less", () => {
    const { game, a } = table();
    const kannushi = spawn(game, "Promised Kannushi");
    const sekki = toGraveyard(game, "Sekki, Seasons' Guide"); // mana value 8
    const pine = toGraveyard(game, "Elder Pine of Jukai");
    const thorns = toGraveyard(game, "Child of Thorns");
    const seen = watchTargets(a, () => [pine]);
    pickModes(a, 0);
    destroy(game, kannushi);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([pine, thorns]));
    expect(seen.offered[0]).not.toContain(sekki);
    expect(zone(game, pine)).toBe("hand");
  });
});
