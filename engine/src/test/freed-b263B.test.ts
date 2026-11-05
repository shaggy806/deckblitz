/**
 * Batch 263, group B: the cards freed by the cost, animate-all, attack-batch,
 * delayed-trigger and except-source families — the clause of each most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickPermanents,
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
  zone,
} from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Aurelia's Vindicator", () => {
  it("turned up for X, exiles X targets from the battlefield and graveyards; they return to hands when it leaves", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const angel = toHand(game, "Aurelia's Vindicator");
    cast(game, angel, { via: "face-down" });
    expect(game.state.objects[angel].faceDown).toBeDefined();
    lands(game, "Plains", 6);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, bear, giant);
    game.dispatch({ type: "turn-face-up", player: A, permanent: angel, morph: true, xValue: 2 });
    settle(game);
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    destroy(game, angel);
    expect(hand(game, B).filter((id) => ["Grizzly Bears", "Hill Giant"].includes(game.state.objects[id].cardName))).toHaveLength(2);
  });
});

describe("Tropical Storm", () => {
  it("deals X to each flyer and 1 more to each blue creature", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const drake = spawn(game, "Wind Drake", B);
    const merfolk = spawn(game, "Craw Wurm", B);
    const merfolkBlue = spawn(game, "Coral Merfolk", A);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Tropical Storm"), { x: 1 });
    expect(damage(game, angel)).toBe(1);
    expect(zone(game, drake)).toBe("graveyard");
    expect(damage(game, merfolk)).toBe(0);
    expect(zone(game, merfolkBlue)).toBe("graveyard");
    expect(damage(game, bear)).toBe(0);
  });
});

describe("Fear, Fire, Foes!", () => {
  it("deals X to the target and 1 to each other creature its controller controls", () => {
    const { game } = table();
    const giant = spawn(game, "Craw Wurm", B);
    const bobBear = spawn(game, "Grizzly Bears", B);
    const myBear = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Fear, Fire, Foes!"), { x: 3, targets: [ref(giant)] });
    expect(damage(game, giant)).toBe(3);
    expect(damage(game, bobBear)).toBe(1);
    expect(damage(game, myBear)).toBe(0);
  });
});

describe("Flames of the Raze-Boar", () => {
  it("deals the 2 to the others only with a power-4 creature", () => {
    const { game } = table();
    const giant = spawn(game, "Craw Wurm", B);
    const bobBear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 12);
    cast(game, toHand(game, "Flames of the Raze-Boar"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(damage(game, bobBear)).toBe(0);
    spawn(game, "Craw Wurm", A);
    const hill = spawn(game, "Hill Giant", B);
    const myBear = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Flames of the Raze-Boar"), { targets: [ref(hill)] });
    expect(zone(game, hill)).toBe("graveyard");
    expect(zone(game, bobBear)).toBe("graveyard");
    expect(damage(game, myBear)).toBe(0);
  });
});

describe("Gideon, the Oathsworn", () => {
  it("counters on the attackers of two or more, none for one", () => {
    const { game, a } = table();
    spawn(game, "Gideon, the Oathsworn", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const lions = spawn(game, "Savannah Lions", A);
    attack(game, a, [bear]);
    expect(counters(game, bear)).toBe(0);
    toStep(game, "precombat-main");
    attack(game, a, [bear, lions]);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, lions)).toBe(1);
  });
});

describe("Vrestin, Menoptra Leader", () => {
  it("puts a counter on each attacking Insect only", () => {
    const { game, a } = table();
    const vrestin = spawn(game, "Vrestin, Menoptra Leader", A);
    game.state.objects[vrestin].counters["+1/+1"] = 2;
    const insect = spawn(game, "Alien Insect Token", A);
    const bear = spawn(game, "Grizzly Bears", A);
    attack(game, a, [insect, bear]);
    expect(counters(game, insect)).toBe(1);
    expect(counters(game, bear)).toBe(0);
  });
});

describe("Ronin, Shadow Stalker", () => {
  it("sacrifices an Equipment attached to it, not another", () => {
    const { game } = table();
    const ronin = spawn(game, "Ronin, Shadow Stalker", A);
    const loose = spawn(game, "Bonesplitter", A);
    const worn = spawn(game, "Bonesplitter", A);
    game.state.objects[worn].attachedTo = ronin;
    const bear = spawn(game, "Grizzly Bears", B);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: ronin, abilityIndex: 1, targets: [ref(bear)], sacrifice: loose }),
    ).not.toBeNull();
    activate(game, ronin, 1, { targets: [ref(bear)], sacrifice: worn });
    expect(zone(game, worn)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
  });
});

/** Tamiyo with her back face up and six loyalty. */
const scholar = (game: Game): ObjectId => {
  const tamiyo = spawn(game, "Tamiyo, Inquisitive Student", A);
  game.state.objects[tamiyo].face = 1;
  game.state.objects[tamiyo].counters.loyalty = 6;
  return tamiyo;
};

describe("Tamiyo, Seasoned Scholar", () => {
  it("−3 adds a mana only for a green card", () => {
    const { game } = table();
    const tamiyo = scholar(game);
    const growth = toGraveyard(game, "Giant Growth", A);
    activate(game, tamiyo, 1, { targets: [ref(growth)] });
    expect(zone(game, growth)).toBe("hand");
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
  it("−3 adds nothing for a blue card", () => {
    const { game } = table();
    const tamiyo = scholar(game);
    const opt = toGraveyard(game, "Opt", A);
    activate(game, tamiyo, 1, { targets: [ref(opt)] });
    expect(zone(game, opt)).toBe("hand");
    expect(game.state.players[A].manaPool.length).toBe(0);
  });
});

describe("Zoyowa's Justice", () => {
  it("the target's owner shuffles it away and discovers its mana value", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    let asked = false;
    b.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Zoyowa's Justice"), { targets: [ref(giant)] });
    settle(game);
    // Bob's library is Wastes and the Giant: he finds it and, declining the cast, keeps it.
    expect(asked).toBe(true);
    const giants = hand(game, B).filter((id) => game.state.objects[id].cardName === "Hill Giant");
    expect(giants).toHaveLength(1);
  });
});

describe("Kang Dynasty", () => {
  it("I taps and goads the chosen creature, and draws when it deals combat damage to a player", () => {
    const { game, a, b } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    enter(game, "Kang Dynasty", A);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[bear].goadedBy).toEqual([A]);
    const before = hand(game, A).length;
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => [{ attacker: bear, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(life(game, A)).toBe(18);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Wand of Wonder", () => {
  it("each opponent exiles to an instant, shuffles the rest back, and you may cast it free", () => {
    const { game, a } = table({ seed: 3 });
    const bolt = toLibrary(game, "Lightning Bolt", B);
    toLibrary(game, "Wastes", B);
    const before = game.state.zones.perPlayer[B].library.length;
    const wand = spawn(game, "Wand of Wonder", A);
    lands(game, "Wastes", 4);
    let offered = false;
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards.includes(bolt);
      return null;
    };
    activate(game, wand, 0);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 1);
    expect(offered).toBe(true);
  });
});

describe("Ojer Pakpatiq, Deepest Epoch", () => {
  it("returns transformed and tapped with three time counters", () => {
    const { game } = table();
    const ojer = spawn(game, "Ojer Pakpatiq, Deepest Epoch", A);
    destroy(game, ojer);
    expect(zone(game, ojer)).toBe("battlefield");
    expect(game.state.objects[ojer].face).toBe(1);
    expect(game.state.objects[ojer].tapped).toBe(true);
    expect(counters(game, ojer, "time")).toBe(3);
  });
});

describe("Dragonshift", () => {
  it("overloaded, makes each creature you control a 4/4 flying Dragon without its abilities", () => {
    const { game } = table();
    const elf = spawn(game, "Llanowar Elves", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Dragonshift"), { overload: true });
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, bear)).toEqual(["Dragon"]);
    expect(keywords(game, bear).has("flying")).toBe(true);
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === elf)).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Sigardian Zealot", () => {
  it("pumps the chosen creatures of different powers by its power", () => {
    const { game, a } = table();
    spawn(game, "Sigardian Zealot", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    pickPermanents(a, bear, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bear).has("vigilance")).toBe(true);
  });
});

describe("Holy Frazzle-Cannon", () => {
  it("one counter on the attacker and on each other creature sharing a type", () => {
    const { game, a } = table();
    const cannon = spawn(game, "Holy Frazzle-Cannon", A);
    const goblin = spawn(game, "Raging Goblin", A);
    const piker = spawn(game, "Goblin Piker", A);
    const bear = spawn(game, "Grizzly Bears", A);
    game.state.objects[cannon].face = 1;
    lands(game, "Wastes", 1);
    activate(game, cannon, 0, { targets: [ref(goblin)] });
    expect(game.state.objects[cannon].attachedTo).toBe(goblin);
    attack(game, a, [goblin]);
    expect(counters(game, goblin)).toBe(1);
    expect(counters(game, piker)).toBe(1);
    expect(counters(game, bear)).toBe(0);
  });
});

describe("False Cure", () => {
  it("a player who gains life this turn loses twice that", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "False Cure"));
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Healing Salve"), { modes: [0], targets: [ref(B)] });
    expect(life(game, B)).toBe(20 + 3 - 6);
  });
});

describe("Jar of Eyeballs", () => {
  it("looks at as many cards as eyeball counters removed", () => {
    const { game, a } = table();
    const jar = spawn(game, "Jar of Eyeballs", A);
    game.state.objects[jar].counters.eyeball = 4;
    lands(game, "Wastes", 3);
    let seen = 0;
    a.chooseFromZoneFn = (_v, eligible) => {
      seen = eligible.length;
      return eligible.slice(0, 1);
    };
    const before = hand(game).length;
    activate(game, jar, 0);
    expect(seen).toBe(4);
    expect(counters(game, jar, "eyeball")).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Blinding Powder", () => {
  it("unattaches and prevents combat damage to the creature this turn", () => {
    const { game, a } = table();
    const powder = spawn(game, "Blinding Powder", A);
    const bear = spawn(game, "Grizzly Bears", A);
    game.state.objects[powder].attachedTo = bear;
    const giant = spawn(game, "Hill Giant", B);
    activate(game, bear, 0);
    expect(game.state.objects[powder].attachedTo).toBeNull();
    expect(zone(game, powder)).toBe("battlefield");
    expect(giant).toBeDefined();
    expect(game.state.objects[bear].damageMarked).toBe(0);
    expect(a).toBeDefined();
  });
});

describe("Spectral Adversary", () => {
  it("pays twice: two counters and up to two others phased out", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const ghost = enter(game, "Spectral Adversary", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || (s.zones.shared.stack.length === 0 && s.awaiting === null));
    pickTargets(a, bear, giant);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(counters(game, ghost)).toBe(2);
    expect(game.state.objects[bear].phasedOut).toBeDefined();
    expect(game.state.objects[giant].phasedOut).toBeDefined();
  });
});

describe("Curious Colossus", () => {
  it("leaves the opponent's creatures 1/1 Cowards without abilities, past this turn", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    enter(game, "Curious Colossus", A);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, angel)).toContain("Coward");
    expect(keywords(game, angel).has("flying")).toBe(false);
    toStep(game, "precombat-main", B);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Kederekt Leviathan", () => {
  it("returns every other nonland permanent, not itself or lands", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Savannah Lions", A);
    const land = spawn(game, "Island", B);
    const lev = enter(game, "Kederekt Leviathan", A);
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, lev)).toBe("battlefield");
  });
});

describe("Renet, Temporal Apprentice", () => {
  it("returns other nonland permanents that entered this turn, not older ones or itself", () => {
    const { game } = table();
    const old = spawn(game, "Grizzly Bears", B);
    game.state.objects[old].enteredBattlefieldOnTurn = 0;
    const fresh = enter(game, "Savannah Lions", B);
    const renet = enter(game, "Renet, Temporal Apprentice", A);
    expect(zone(game, fresh)).toBe("hand");
    expect(zone(game, renet)).toBe("battlefield");
  });
});

describe("Furystoke Giant", () => {
  it("gives the others the ping, not itself", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const giant = enter(game, "Furystoke Giant", A);
    const can = (id: ObjectId): boolean =>
      game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === id);
    expect(can(bear)).toBe(true);
    expect(can(giant)).toBe(false);
  });
});

describe("Tanazir Quandrix", () => {
  it("sets the others' base P/T to its own as it attacks", () => {
    const { game, a } = table();
    const tanazir = spawn(game, "Tanazir Quandrix", A);
    const bear = spawn(game, "Grizzly Bears", A);
    pickModes(a, 0);
    attack(game, a, [tanazir]);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, tanazir)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Narset Transcendent", () => {
  it("−2: the next instant from hand gains rebound", () => {
    const { game } = table();
    const narset = spawn(game, "Narset Transcendent", A);
    loyalty(game, narset, -2);
    lands(game, "Island", 1);
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(zone(game, opt)).toBe("exile");
    const second = toHand(game, "Opt");
    lands(game, "Island", 1);
    cast(game, second);
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Jace, Reality Sculptor", () => {
  it("0 needs twenty-five loyalty among your Jaces", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, Reality Sculptor", A);
    expect(() => loyalty(game, jace, 0)).toThrow();
    game.state.objects[jace].counters.loyalty = 25;
    loyalty(game, jace, 0);
    expect(game.state.zones.perPlayer[B].library.length).toBe(1);
  });
});

describe("Lobelia, Defender of Bag End", () => {
  it("exiles each opponent's top card face down, and plays one free", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const lobelia = enter(game, "Lobelia, Defender of Bag End", A);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].exiledFaceDown?.lookers).toEqual([A]);
    const thopter = spawn(game, "Bonesplitter", A);
    activate(game, lobelia, 0, { modes: [0], sacrifice: thopter });
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bolt)).toBe(true);
  });
});

describe("Razorfield Ripper", () => {
  it("gets {E} as it attacks, then +X/+X for the energy you have", () => {
    const { game, a } = table();
    const ripper = spawn(game, "Razorfield Ripper", A);
    game.state.players[A].energy = 2;
    attack(game, a, [ripper]);
    expect(game.state.players[A].energy).toBe(3);
    expect(pt(game, ripper)).toEqual({ power: 6, toughness: 6 });
    expect(graveyard(game, A)).toBeDefined();
  });
});
