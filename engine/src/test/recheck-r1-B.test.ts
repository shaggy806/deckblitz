/**
 * Recheck list R1, group B: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
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
  destroy,
  enter,
} from "./harness.js";

describe("Cruel Ultimatum", () => {
  it("makes the opponent sacrifice, discard three and lose 5; you return a creature, draw three, gain 5", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const dead = toGraveyard(game, "Grizzly Bears", A);
    const card = toHand(game, "Cruel Ultimatum");
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    pickFromZone(a, dead);
    cast(game, card, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(theirs - 3);
    expect(life(game, B)).toBe(15);
    expect(zone(game, dead)).toBe("hand");
    expect(hand(game).length).toBe(mine - 1 + 1 + 3);
    expect(life(game)).toBe(25);
  });
});

describe("Dire Tactics", () => {
  it("loses life equal to the exiled creature's toughness as it last existed", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    cast(game, toHand(game, "Dire Tactics"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(17);
  });

  it("loses nothing while you control a Human", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    spawn(game, "Fiend Hunter");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Dire Tactics"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(20);
  });
});

describe("Fiend Hunter", () => {
  it("exiles another creature and returns it when it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    const hunter = enter(game, "Fiend Hunter");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, hunter);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Fumulus, the Infestation", () => {
  it("makes an Insect when any player sacrifices a nontoken creature, and drains as an Insect attacks", () => {
    const { game, a } = table();
    const fumulus = spawn(game, "Fumulus, the Infestation");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Diabolic Edict"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Insect Token (Black, Flying)", A)).toBe(1);
    attack(game, a, [fumulus]);
    expect(life(game, B)).toBe(20 - 1 - 2);
    expect(life(game)).toBe(21);
  });
});

describe("Mana Echoes", () => {
  it("adds {C} for each creature you control sharing a type with the entering one, itself included", () => {
    const { game, a } = table();
    spawn(game, "Mana Echoes");
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    enter(game, "Llanowar Elves");
    const pool = game.state.players[A].manaPool;
    expect(pool.map((u) => u.type)).toEqual(["C", "C"]);
  });
});

describe("Phyrexian Scriptures", () => {
  it("I makes the creature an artifact with a counter; II spares it and destroys the rest", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine);
    cast(game, toHand(game, "Phyrexian Scriptures"));
    expect(counters(game, mine)).toBe(1);
    expect(types(game, mine)).toContain("artifact");
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Prishe's Wanderings", () => {
  it("fetches a basic land tapped, then the reflexive ability puts a counter on your creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    pickTargets(a, bears);
    cast(game, toHand(game, "Prishe's Wanderings"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Shadow, Mysterious Assassin", () => {
  it("sacrifices another nonland permanent: draws two, each opponent loses its mana value", () => {
    const { game, a } = table();
    const shadow = spawn(game, "Shadow, Mysterious Assassin");
    const bears = spawn(game, "Grizzly Bears");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const land = lands(game, "Wastes", 1)[0];
    const before = hand(game).length;
    let eligible: readonly ObjectId[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, offered) => {
      eligible = offered;
      return [dreadmaw];
    };
    attack(game, a, [shadow]);
    expect([...eligible].sort()).toEqual([bears, dreadmaw].sort());
    expect(eligible).not.toContain(land);
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, B)).toBe(20 - 3 - 6);
  });
});

describe("Summon: Shiva", () => {
  it("chapter I taps an opponent's creature and stuns it", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Summon: Shiva"));
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Venarian Glimmer", () => {
  it("offers only nonland cards with mana value X or less", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears", B);
    const dreadmaw = toHand(game, "Colossal Dreadmaw", B);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Venarian Glimmer"), { targets: [ref(B)], x: 2 });
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(dreadmaw);
    expect(graveyard(game, B)).toContain(bears);
  });
});

describe("Savage Stomp", () => {
  it("costs {2} less targeting a Dinosaur you control", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const dino = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Savage Stomp"), { targets: [ref(dino), ref(bears)] });
    expect(counters(game, dino)).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("costs full price otherwise", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Savage Stomp"), { targets: [ref(mine), ref(bears)] })).toThrow();
  });
});

describe("Counterbalance", () => {
  it("counters an opponent's spell with the revealed card's mana value, and not another", () => {
    const { game, a } = table();
    spawn(game, "Counterbalance");
    nextTurn(game);
    lands(game, "Forest", 4, B);
    pickModes(a, 0);
    toLibrary(game, "Llanowar Elves");
    const first = toHand(game, "Grizzly Bears", B);
    cast(game, first, { player: B });
    expect(zone(game, first)).toBe("battlefield");
    toLibrary(game, "Grizzly Bears");
    const second = toHand(game, "Grizzly Bears", B);
    cast(game, second, { player: B });
    expect(zone(game, second)).toBe("graveyard");
  });
});
