/**
 * Set walk batch 82, part f (2026-10-15): Final Fantasy (FIN) and Final Fantasy Commander (FIC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

const canActivate = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

/** Cast a four-mana noncreature spell (Concentrate) and a three-mana one
 * (Divination) — seven Islands pay for both. */
const castFourThenThree = (game: Game): { four: () => void; three: () => void } => {
  lands(game, "Island", 7);
  return {
    four: () => cast(game, toHand(game, "Concentrate")),
    three: () => cast(game, toHand(game, "Divination")),
  };
};

describe("Galuf's Final Act", () => {
  it("gives +1/+0 and a dies trigger putting counters equal to its last power on up to one creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Galuf's Final Act"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    pickTargets(a, giant);
    destroy(game, bears);
    // Its power as it last existed: 2 printed +1 from the spell.
    expect(counters(game, giant)).toBe(3);
  });

  it("lasts only until end of turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Galuf's Final Act"), { targets: [ref(bears)] });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    pickTargets(a, giant);
    destroy(game, bears);
    expect(counters(game, giant)).toBe(0);
  });
});

describe("Ice Flan", () => {
  it("taps an opponent's artifact and stuns it as it enters", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    pickTargets(a, stone);
    cast(game, toHand(game, "Ice Flan"));
    expect(tapped(game, stone)).toBe(true);
    expect(counters(game, stone, "stun")).toBe(1);
  });
});

describe("Xande, Dark Mage", () => {
  it("gets +1/+1 for each noncreature, nonland card in your graveyard", () => {
    const { game } = table();
    const xande = spawn(game, "Xande, Dark Mage");
    expect(pt(game, xande)).toEqual({ power: 3, toughness: 3 });
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Mind Stone");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Shock", B);
    expect(pt(game, xande)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Snow Villiers", () => {
  it("has power equal to the creatures you control, itself included", () => {
    const { game } = table();
    const snow = spawn(game, "Snow Villiers");
    expect(pt(game, snow)).toEqual({ power: 1, toughness: 3 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, snow)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, snow).has("vigilance")).toBe(true);
  });
});

describe("Blazing Bomb", () => {
  it("grows only off a noncreature spell with four or more mana spent", () => {
    const { game } = table();
    const bomb = spawn(game, "Blazing Bomb");
    const spells = castFourThenThree(game);
    spells.three();
    expect(counters(game, bomb)).toBe(0);
    spells.four();
    expect(counters(game, bomb)).toBe(1);
  });

  it("Blow Up deals damage equal to its last-known power", () => {
    const { game } = table();
    const bomb = spawn(game, "Blazing Bomb");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bomb)]);
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, bomb, 0, { targets: [ref(theirs)] });
    expect(zone(game, bomb)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Random Encounter", () => {
  it("puts the milled creature cards onto the battlefield with haste, and returns those still there at the end step", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 6);
    const before = named(game, "Grizzly Bears", A).length;
    cast(game, toHand(game, "Random Encounter"));
    const bears = named(game, "Grizzly Bears", A);
    expect(bears).toHaveLength(before + 4);
    for (const id of bears) expect(keywords(game, id).has("haste")).toBe(true);
    destroy(game, bears[0]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears[0])).toBe("graveyard");
    for (const id of bears.slice(1)) expect(zone(game, id)).toBe("hand");
  });

  it("leaves milled noncreature cards in the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const before = graveyard(game).length;
    cast(game, toHand(game, "Random Encounter"));
    // Four Wastes and the spell itself.
    expect(graveyard(game)).toHaveLength(before + 5);
    expect(named(game, "Wastes", A)).toHaveLength(0);
  });
});

describe("Bard's Bow", () => {
  it("makes a Hero and equips it: +2/+2, reach, and a Bard", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bow = toHand(game, "Bard's Bow");
    cast(game, bow);
    const [hero] = named(game, "Hero Token (Black Mage's Rod)", A);
    expect(game.state.objects[bow].attachedTo).toBe(hero);
    expect(pt(game, hero)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, hero).has("reach")).toBe(true);
    expect(subtypes(game, hero)).toContain("Bard");
    expect(subtypes(game, hero)).toContain("Hero");
  });
});

describe("Demon Wall", () => {
  it("can attack only while it has a counter on it, of any kind", () => {
    const { game } = table();
    const wall = spawn(game, "Demon Wall");
    expect(whyCannotAttack(game.state, game.registry, A, wall, B)).toMatch(/defender/);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(wall)]);
    expect(whyCannotAttack(game.state, game.registry, A, wall, B)).toBeNull();
  });

  it("puts two +1/+1 counters on itself for {5}{B}", () => {
    const { game } = table();
    const wall = spawn(game, "Demon Wall");
    lands(game, "Swamp", 6);
    activate(game, wall);
    expect(pt(game, wall)).toEqual({ power: 5, toughness: 5 });
    expect(whyCannotAttack(game.state, game.registry, A, wall, B)).toBeNull();
  });
});

describe("Qiqirn Merchant", () => {
  it("loots for {1}", () => {
    const { game, a } = table();
    const merchant = spawn(game, "Qiqirn Merchant");
    lands(game, "Island", 1);
    const junk = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [junk];
    const before = hand(game).length;
    activate(game, merchant);
    expect(hand(game)).toHaveLength(before);
    expect(zone(game, junk)).toBe("graveyard");
  });

  it("draws three for {7} less {1} per Town", () => {
    const { game } = table();
    const merchant = spawn(game, "Qiqirn Merchant");
    lands(game, "Island", 5);
    expect(canActivate(game, merchant, 1)).toBe(false);
    lands(game, "Gongaga, Reactor Town", 2);
    // {7} less two: {5}, and five Islands to pay it (the Towns are spare).
    expect(canActivate(game, merchant, 1)).toBe(true);
    const before = hand(game).length;
    activate(game, merchant, 1);
    expect(hand(game)).toHaveLength(before + 3);
    expect(zone(game, merchant)).toBe("graveyard");
  });
});

describe("Gigantoad and Scorpion Sentinel", () => {
  it("get their bonus from the seventh land", () => {
    const { game } = table();
    const toad = spawn(game, "Gigantoad");
    const scorpion = spawn(game, "Scorpion Sentinel");
    lands(game, "Forest", 6);
    expect(pt(game, toad)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, scorpion)).toEqual({ power: 1, toughness: 4 });
    lands(game, "Forest", 1, B);
    expect(pt(game, toad)).toEqual({ power: 4, toughness: 4 });
    lands(game, "Forest", 1);
    expect(pt(game, toad)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, scorpion)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Retrieve the Esper", () => {
  it("makes a 3/3 blue Robot Warrior from the hand", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Retrieve the Esper"));
    const [robot] = named(game, "Robot Warrior Token", A);
    expect(pt(game, robot)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, robot)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(counters(game, robot)).toBe(0);
  });

  it("puts two +1/+1 counters on it when cast from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const card = toGraveyard(game, "Retrieve the Esper");
    cast(game, card, { via: "flashback" });
    const [robot] = named(game, "Robot Warrior Token", A);
    expect(counters(game, robot)).toBe(2);
    expect(pt(game, robot)).toEqual({ power: 5, toughness: 5 });
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Cloud of Darkness", () => {
  it("gives an opponent's creature -X/-X, X the permanent cards in your graveyard as it resolves", () => {
    const { game } = table();
    const theirs = spawn(game, "Gigantoad", B);
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Mind Stone");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Forest", B);
    enter(game, "Cloud of Darkness");
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    toGraveyard(game, "Ornithopter");
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Shambling Cie'th", () => {
  it("enters tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const card = toHand(game, "Shambling Cie'th");
    cast(game, card);
    expect(tapped(game, card)).toBe(true);
  });

  it("returns from the graveyard to hand when you cast a noncreature spell and pay {B}", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Island", 1);
    const card = toGraveyard(game, "Shambling Cie'th");
    pickModes(a, 0);
    cast(game, toHand(game, "Opt"));
    expect(zone(game, card)).toBe("hand");
  });

  it("doesn't trigger off a creature spell", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const card = toGraveyard(game, "Shambling Cie'th");
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Sahagin", () => {
  it("grows and can't be blocked this turn off a four-mana noncreature spell", () => {
    const { game } = table();
    const sahagin = spawn(game, "Sahagin");
    const spells = castFourThenThree(game);
    spells.three();
    expect(counters(game, sahagin)).toBe(0);
    expect(keywords(game, sahagin).has("unblockable")).toBe(false);
    spells.four();
    expect(counters(game, sahagin)).toBe(1);
    expect(keywords(game, sahagin).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(keywords(game, sahagin).has("unblockable")).toBe(false);
  });
});

describe("Cactuar", () => {
  it("stays at the end step of the turn it entered, and returns to hand at a later one", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const card = toHand(game, "Cactuar");
    cast(game, card);
    toStep(game, "end");
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, card)).toBe("hand");
  });
});

describe("Gaelicat", () => {
  it("gets +2/+0 with two or more artifacts", () => {
    const { game } = table();
    const cat = spawn(game, "Gaelicat");
    spawn(game, "Mind Stone");
    expect(pt(game, cat)).toEqual({ power: 1, toughness: 3 });
    spawn(game, "Mind Stone");
    expect(pt(game, cat)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, cat).has("flying")).toBe(true);
  });
});

describe("Sandworm", () => {
  it("destroys a land, and its controller may fetch a basic land tapped", () => {
    const { game, a, b } = table();
    const forest = spawn(game, "Forest", B);
    const basic = game.state.zones.perPlayer[B].library[0];
    pickTargets(a, forest);
    pickFromZone(b, basic);
    enter(game, "Sandworm");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, basic)).toBe("battlefield");
    expect(game.state.objects[basic].controller).toBe(B);
    expect(tapped(game, basic)).toBe(true);
  });
});

describe("Auron's Inspiration", () => {
  it("gives attacking creatures +2/+0 until end of turn", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const homebody = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null && s.zones.shared.stack.length === 0,
    );
    cast(game, toHand(game, "Auron's Inspiration"));
    expect(pt(game, attacker)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, homebody)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Sidequest: Card Collection // Magicked Card", () => {
  it("draws three and discards two as it enters", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const card = toHand(game, "Sidequest: Card Collection");
    const before = hand(game).length;
    const graveBefore = graveyard(game).length;
    cast(game, card);
    // The Sidequest left the hand, three came in and two went.
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(graveBefore + 2);
  });

  it("transforms into a 4/4 flying Vehicle at your end step with eight cards in your graveyard", () => {
    const { game } = table();
    const card = spawn(game, "Sidequest: Card Collection");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[card].face ?? 0).toBe(0);
    toGraveyard(game, "Wastes");
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[card].face).toBe(1);
    expect(subtypes(game, card)).toContain("Vehicle");
    expect(keywords(game, card).has("flying")).toBe(true);
    expect(pt(game, card)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Namazu Trader", () => {
  it("costs 1 life and makes a Treasure as it enters", () => {
    const { game } = table();
    enter(game, "Namazu Trader");
    expect(life(game)).toBe(19);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("may sacrifice another creature or artifact on attack to surveil 2", () => {
    const { game, a } = table();
    const trader = spawn(game, "Namazu Trader");
    const thopter = spawn(game, "Ornithopter");
    const top = toLibrary(game, "Lightning Bolt");
    const second = toLibrary(game, "Shock");
    pickModes(a, 0);
    a.choosePermanentsFn = () => [thopter];
    a.chooseSacrificesFn = () => [thopter];
    a.chooseScryFn = (_view, cards) => cards;
    a.declareAttackersFn = () => [{ attacker: trader, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, trader)).toBe("battlefield");
  });
});

describe("The Prima Vista", () => {
  it("becomes an artifact creature until end of turn off a four-mana noncreature spell", () => {
    const { game } = table();
    const ship = spawn(game, "The Prima Vista");
    const spells = castFourThenThree(game);
    spells.three();
    expect(types(game, ship)).not.toContain("creature");
    spells.four();
    expect(types(game, ship)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ship)).toEqual({ power: 5, toughness: 3 });
    nextTurn(game);
    expect(types(game, ship)).not.toContain("creature");
  });
});

describe("Magitek Infantry", () => {
  it("gets +1/+0 only with another artifact", () => {
    const { game } = table();
    const infantry = spawn(game, "Magitek Infantry");
    expect(pt(game, infantry)).toEqual({ power: 1, toughness: 1 });
    const other = spawn(game, "Magitek Infantry");
    expect(pt(game, infantry)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 1 });
  });

  it("fetches another Magitek Infantry onto the battlefield tapped", () => {
    const { game, a } = table();
    const infantry = spawn(game, "Magitek Infantry");
    lands(game, "Plains", 3);
    const card = toLibrary(game, "Magitek Infantry");
    const seen = pickFromZone(a, card);
    activate(game, infantry);
    expect(seen.offered).toEqual([card]);
    expect(zone(game, card)).toBe("battlefield");
    expect(tapped(game, card)).toBe(true);
  });
});
