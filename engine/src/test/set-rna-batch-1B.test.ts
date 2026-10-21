/**
 * Set walk batch 124, group B (2026-10-21): Ravnica Allegiance (RNA).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card);

describe("The Haunt of Hightower", () => {
  it("grows when a card goes to an opponent's graveyard — not a token, not your own card", () => {
    const { game } = table();
    const haunt = spawn(game, "The Haunt of Hightower");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs);
    expect(counters(game, haunt)).toBe(1);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].isToken && game.state.objects[id].controller === B);
    expect(token).toBeDefined();
    destroy(game, token as ObjectId);
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, mine);
    expect(counters(game, haunt)).toBe(1);
  });
});

describe("Nikya of the Old Ways", () => {
  it("can't cast a noncreature spell, but can cast a creature", () => {
    const { game } = table();
    spawn(game, "Nikya of the Old Ways");
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    const divination = toHand(game, "Divination");
    const bears = toHand(game, "Grizzly Bears");
    expect(castable(game, divination)).toBe(false);
    expect(castable(game, bears)).toBe(true);
  });
});

describe("Gatebreaker Ram", () => {
  it("gets +1/+1 per Gate, and vigilance and trample only with two", () => {
    const { game } = table();
    const ram = spawn(game, "Gatebreaker Ram");
    spawn(game, "Azorius Guildgate");
    expect(pt(game, ram)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, ram).has("trample")).toBe(false);
    spawn(game, "Azorius Guildgate");
    expect(pt(game, ram)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, ram).has("trample")).toBe(true);
    expect(keywords(game, ram).has("vigilance")).toBe(true);
  });
});

describe("Final Payment", () => {
  it("paying 5 life destroys the creature", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Final Payment"), { targets: [ref(giant)], costOption: 0 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(15);
  });
});

describe("Angel of Grace", () => {
  it("entering holds you at 1 life against damage this turn", () => {
    const { game } = table();
    enter(game, "Angel of Grace");
    game.debugApplyEffect(B, { kind: "damage", amount: 30, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(1);
  });

  it("from the graveyard, your life total becomes 10 — down from more, up from less", () => {
    const { game } = table();
    const angel = toGraveyard(game, "Angel of Grace");
    lands(game, "Plains", 6);
    activate(game, angel, 0);
    expect(life(game, A)).toBe(10);
    expect(zone(game, angel)).toBe("exile");
    game.debugApplyEffect(B, { kind: "damage", amount: 7, target: 0 }, [ref(A)]);
    settle(game);
    const second = toGraveyard(game, "Angel of Grace");
    lands(game, "Plains", 6);
    activate(game, second, 0);
    expect(life(game, A)).toBe(10);
  });
});

describe("Undercity's Embrace", () => {
  it("the opponent sacrifices; 4 life only if you control a creature with power 4 or greater", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Undercity's Embrace"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    spawn(game, "Angel of Grace");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Undercity's Embrace"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(24);
  });
});

describe("Fireblade Artist", () => {
  it("sacrificing a creature in your upkeep deals 2 damage to the opponent", () => {
    const { game, a } = table();
    spawn(game, "Fireblade Artist");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseSacrificesFn = () => [bears];
    pickModes(a, 0);
    pickTargets(a, B);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Sphinx of the Guildpact", () => {
  it("an opponent's monocolored spell can't target it; a multicolored one can", () => {
    const { game } = table();
    const sphinx = spawn(game, "Sphinx of the Guildpact");
    nextTurn(game);
    lands(game, "Mountain", 2, B);
    lands(game, "Plains", 1, B);
    const aimed = (card: ObjectId): string | null =>
      game.canDispatch({ type: "cast-spell", player: B, card, targets: [ref(sphinx)] });
    const shock = toHand(game, "Shock", B);
    const helix = toHand(game, "Lightning Helix", B);
    expect(aimed(shock)).not.toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: B, card: shock, targets: [ref(A)] })).toBeNull();
    expect(aimed(helix)).toBeNull();
    cast(game, helix, { player: B, targets: [ref(sphinx)] });
    expect(game.state.objects[sphinx].damageMarked).toBe(3);
  });
});

describe("Carnival // Carnage", () => {
  it("Carnival deals 1 to the creature and 1 to its controller", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Carnival // Carnage"), { face: 1, targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
  });

  it("Carnage deals 3 to the opponent, who discards two", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Carnival // Carnage"), { face: 2, targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 2);
    expect(graveyard(game, B).length).toBe(2);
  });
});

describe("Summary Judgment", () => {
  it("deals 5 in your main phase, 3 outside it", () => {
    const { game } = table();
    const first = spawn(game, "Angel of Grace", B, { tapped: true });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Summary Judgment"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("graveyard");
    toStep(game, "upkeep");
    const second = spawn(game, "Angel of Grace", B, { tapped: true });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Summary Judgment"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[second].damageMarked).toBe(3);
  });
});

describe("Code of Constraint", () => {
  it("-4/-0 and a draw; in your main phase it taps the creature, which doesn't untap next", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 3);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Code of Constraint"), { targets: [ref(giant)] });
    expect(pt(game, giant).power).toBe(-1);
    expect(hand(game, A).length).toBe(before + 1);
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].skipsNextUntap).toBe(true);
  });

  it("outside your main phase it neither taps nor freezes", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 3);
    toStep(game, "upkeep");
    cast(game, toHand(game, "Code of Constraint"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(game.state.objects[giant].skipsNextUntap).toBeUndefined();
  });
});

describe("Growth-Chamber Guardian", () => {
  it("adapting finds another Growth-Chamber Guardian", () => {
    const { game, a } = table();
    const guardian = spawn(game, "Growth-Chamber Guardian");
    const other = toLibrary(game, "Growth-Chamber Guardian");
    lands(game, "Forest", 3);
    pickModes(a, 0);
    pickFromZone(a, other);
    activate(game, guardian, 0);
    expect(counters(game, guardian)).toBe(2);
    expect(zone(game, other)).toBe("hand");
  });
});

describe("Rally to Battle", () => {
  it("gives your creatures +1/+3 and untaps them", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Rally to Battle"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 5 });
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});
