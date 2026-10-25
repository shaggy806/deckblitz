/**
 * Set walk: Eldritch Moon (EMN), group D — the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import { faceName } from "../state.js";

import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  hand,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const face = (game: Game, id: ObjectId): string => faceName(game.state.objects[id]);

describe("Curious Homunculus // Voracious Reader", () => {
  it("transforms at upkeep with three instant and/or sorcery cards in the graveyard", () => {
    const { game } = table();
    const homunculus = spawn(game, "Curious Homunculus");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toStep(game, "upkeep");
    settle(game);
    expect(face(game, homunculus)).toBe("Voracious Reader");
  });

  it("stays put with only two (a creature card doesn't count)", () => {
    const { game } = table();
    const homunculus = spawn(game, "Curious Homunculus");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(face(game, homunculus)).toBe("Curious Homunculus");
  });
});

describe("Long Road Home", () => {
  it("returns the card at the next end step under its owner's control with a +1/+1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Long Road Home"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Grizzly Bears", B);
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(B);
    expect(counters(game, back)).toBe(1);
  });
});

describe("Blessed Alliance", () => {
  it("escalates: two modes cost {2} more — gain 4 life and untap two creatures", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", A, { tapped: true });
    const two = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Blessed Alliance"), { modes: [0, 1], targets: [ref(A), ref(one), ref(two)] });
    expect(life(game)).toBe(24);
    expect(game.state.objects[one].tapped).toBe(false);
    expect(game.state.objects[two].tapped).toBe(false);
  });

  it("can't take a second mode without the escalate mana", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    expect(() => cast(game, toHand(game, "Blessed Alliance"), { modes: [0, 1], targets: [ref(A), null, null] })).toThrow();
  });
});

describe("Shreds of Sanity", () => {
  it("returns an instant and a sorcery, discards a card, and exiles itself", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    lands(game, "Mountain", 3);
    const shreds = toHand(game, "Shreds of Sanity");
    const before = hand(game).length;
    cast(game, shreds, { targets: [ref(bolt), ref(divination)] });
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, divination)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 2 - 1);
    expect(zone(game, shreds)).toBe("exile");
  });
});

describe("Conduit of Storms", () => {
  it("attacking adds {R} at the beginning of this turn's postcombat main", () => {
    const { game, a } = table();
    const conduit = spawn(game, "Conduit of Storms");
    attack(game, a, [conduit]);
    expect(life(game, B)).toBe(18);
    settle(game);
    expect(game.state.turn.number).toBe(1);
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(1);
  });
});

describe("Furyblade Vampire", () => {
  it("discarding at beginning of combat gives it +3/+0", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Furyblade Vampire");
    pickModes(a, 0);
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, vampire)).toEqual({ power: 4, toughness: 2 });
  });

  it("declining leaves it a 1/2", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Furyblade Vampire");
    pickModes(a);
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(pt(game, vampire)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Certain Death", () => {
  it("destroys the creature; its controller loses 2 and you gain 2", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Certain Death"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});
