/**
 * The Hobbit (HOB), batch 1, part b (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
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
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Plunder the Trollshaws", () => {
  it("draws one card from the hand and two by flashback from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const plunder = toHand(game, "Plunder the Trollshaws");
    const before = hand(game).length;
    cast(game, plunder);
    // The spell left the hand, one card came in.
    expect(hand(game)).toHaveLength(before);
    expect(zone(game, plunder)).toBe("graveyard");

    const again = toGraveyard(game, "Plunder the Trollshaws");
    lands(game, "Island", 4);
    const mid = hand(game).length;
    cast(game, again, { via: "flashback" });
    expect(hand(game)).toHaveLength(mid + 2);
    expect(zone(game, again)).toBe("exile");
  });
});

describe("Stone by Sunlight", () => {
  it("makes a creature an indestructible artifact until end of turn", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Stone by Sunlight"), { modes: [1], targets: [ref(bear)] });
    expect(types(game, bear)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(keywords(game, bear).has("indestructible")).toBe(true);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("can only destroy a creature with power 4 or greater", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Serra Angel", B);
    const stone = toHand(game, "Stone by Sunlight");
    expect(() => cast(game, stone, { modes: [0], targets: [ref(bear)] })).toThrow();
    cast(game, stone, { modes: [0], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Chief Warg's Company", () => {
  it("can't attack unless you control two or more other Wolves", () => {
    const { game } = table();
    const chief = spawn(game, "Chief Warg's Company");
    spawn(game, "Wolf Token");
    expect(game.characteristics(chief).restrictions).toContain("cant-attack");
    spawn(game, "Wolf Token");
    expect(game.characteristics(chief).restrictions).not.toContain("cant-attack");
  });

  it("makes a 2/2 Wolf at the beginning of your upkeep", () => {
    const { game } = table();
    spawn(game, "Chief Warg's Company");
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });
});

describe("Iron Hills Stalwart", () => {
  it("attaches an Equipment you control to a creature you control as it enters", () => {
    const { game, a } = table();
    const greaves = spawn(game, "Lightning Greaves");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, greaves, bear);
    enter(game, "Iron Hills Stalwart");
    expect(game.state.objects[greaves].attachedTo).toBe(bear);
  });
});

describe("Wargling", () => {
  it("gets +1/+0 and gives your creatures trample when it attacks beside a creature with power 4 or greater", () => {
    const { game, a } = table();
    const wargling = spawn(game, "Wargling");
    const giant = spawn(game, "Serra Angel");
    const bear = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: wargling, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(pt(game, wargling)).toEqual({ power: 3, toughness: 2 });
    for (const id of [wargling, giant, bear]) expect(keywords(game, id).has("trample")).toBe(true);
  });

  it("doesn't trigger without a creature with power 4 or greater", () => {
    const { game, a } = table();
    const wargling = spawn(game, "Wargling");
    a.declareAttackersFn = () => [{ attacker: wargling, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(pt(game, wargling)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, wargling).has("trample")).toBe(false);
  });
});

describe("Great Gilded Boat", () => {
  it("recruits whenever you attack, even when it doesn't: a nonland discard makes a Human Soldier", () => {
    const { game, a } = table();
    spawn(game, "Great Gilded Boat");
    const bear = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    attack(game, a, [bear]);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });
});

describe("Lake-town Lookout", () => {
  it("recruits when it dies: a land discarded makes no token", () => {
    const { game, a } = table();
    const lookout = spawn(game, "Lake-town Lookout");
    const before = hand(game).length;
    // The draw is a Wastes; discard it.
    a.chooseDiscardsFn = (cards) => [cards[cards.length - 1].id];
    destroy(game, lookout);
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(1);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
  });
});

describe("Nasty Little Rabbit", () => {
  it("grows at the beginning of combat only while you control a creature with power 4 or greater", () => {
    const { game } = table();
    const rabbit = spawn(game, "Nasty Little Rabbit");
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, rabbit)).toBe(0);
    spawn(game, "Serra Angel");
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, rabbit)).toBe(1);
  });
});

describe("Dreaded Bat-Cloud", () => {
  it("costs {3} less once a creature died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bat = toHand(game, "Dreaded Bat-Cloud");
    expect(castOffers(game, bat)).toHaveLength(0);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(castOffers(game, bat).length).toBeGreaterThan(0);
    cast(game, bat);
    expect(zone(game, bat)).toBe("battlefield");
  });
});

describe("Esgaroth Garrison", () => {
  it("has power equal to the creatures you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const garrison = enter(game, "Esgaroth Garrison");
    // The bear, the Garrison and the recruited Human Soldier.
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
    expect(pt(game, garrison)).toEqual({ power: 3, toughness: 5 });
  });
});

describe("Mirkwood Nurturer", () => {
  it("returns another permanent you control and gets a +1/+1 counter", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    const nurturer = enter(game, "Mirkwood Nurturer");
    expect(zone(game, bear)).toBe("hand");
    expect(counters(game, nurturer)).toBe(1);
  });

  it("gets no counter when nothing is returned", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    pickTargets(a, null);
    const nurturer = enter(game, "Mirkwood Nurturer");
    expect(counters(game, nurturer)).toBe(0);
  });
});

describe("Eagle of the Great Shelf", () => {
  it("gets +1/+1 for each other creature you control when it attacks", () => {
    const { game, a } = table();
    const eagle = spawn(game, "Eagle of the Great Shelf");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: eagle, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(pt(game, eagle)).toEqual({ power: 4, toughness: 7 });
  });
});

describe("Gundabad Opportunist", () => {
  it("exiles the top card of your library, playable until the end of your next turn", () => {
    const { game } = table();
    const top = toLibrary(game, "Grizzly Bears");
    enter(game, "Gundabad Opportunist");
    expect(zone(game, top)).toBe("exile");
    lands(game, "Forest", 2);
    // Alice's next turn: still playable (a creature, at sorcery speed).
    toStep(game, "precombat-main");
    expect(castOffers(game, top).length).toBeGreaterThan(0);
    // The turn after: lapsed.
    toStep(game, "precombat-main");
    expect(zone(game, top)).toBe("exile");
    expect(castOffers(game, top)).toHaveLength(0);
  });
});

describe("Troll Negotiations", () => {
  it("puts two +1/+1 counters on your creature, then it fights", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Troll Negotiations"), { targets: [ref(bear), ref(giant)] });
    expect(counters(game, bear)).toBe(2);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Lake-town Toymaker", () => {
  it("pumps another creature at the beginning of combat only once you've drawn two cards this turn", () => {
    const { game, a } = table();
    spawn(game, "Lake-town Toymaker");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    // Turn 1's draw is one card.
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });

    toStep(game, "precombat-main");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bear).has("first-strike")).toBe(true);
  });
});
