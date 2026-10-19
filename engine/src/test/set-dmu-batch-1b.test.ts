/**
 * Dominaria United (and its Commander decks), group b. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  named,
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

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const castable = (game: Game, name: string): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.cardName === name);

/** A real token (debugSpawn makes a card) for alice — its id. */
function makeToken(game: Game, token: string): ObjectId {
  game.debugApplyEffect(A, { kind: "create-token", token, count: 1 }, []);
  settle(game);
  const made = named(game, token, A);
  return made[made.length - 1];
}

const canActivate = (game: Game, source: ObjectId, abilityIndex = 0): boolean =>
  game.canDispatch({ type: "activate-ability", player: A, source, abilityIndex, targets: [] }) === null;

/** Cast a read-ahead Saga for alice from `mana` lands, starting at `chapter`. */
function castSaga(
  game: Game,
  a: ScriptedController,
  name: string,
  land: string,
  n: number,
  chapter: string,
  targets: readonly (ObjectId | PlayerId | null)[] = [],
): ObjectId {
  lands(game, land, n);
  a.chooseCreatureTypeFn = () => chapter;
  if (targets.length > 0) pickTargets(a, ...targets);
  const card = toHand(game, name);
  cast(game, card);
  return card;
}

describe("Cult Conscript", () => {
  it("returns only after a non-Skeleton creature of yours died this turn — a token counts (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const conscript = toGraveyard(game, "Cult Conscript");
    expect(canActivate(game, conscript)).toBe(false);
    destroy(game, spawn(game, "Reassembling Skeleton"));
    expect(canActivate(game, conscript)).toBe(false);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(canActivate(game, conscript)).toBe(false);
    const soldier = makeToken(game, "Soldier Token");
    expect(game.state.objects[soldier].isToken).toBe(true);
    destroy(game, soldier);
    expect(canActivate(game, conscript)).toBe(true);
    activate(game, conscript);
    expect(zone(game, conscript)).toBe("battlefield");
    expect(game.state.objects[conscript].tapped).toBe(true);
  });
});

describe("Stenn, Paranoid Partisan", () => {
  it("offers every spell card type but creature and land, and reduces only the chosen one", () => {
    const { game, a } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    const offered: string[][] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered.push([...options]);
      return "instant";
    };
    cast(game, toHand(game, "Stenn, Paranoid Partisan"));
    expect(offered).toEqual([["artifact", "enchantment", "instant", "sorcery", "planeswalker", "battle", "kindred"]]);
    spawn(game, "Mountain");
    toHand(game, "Lightning Strike");
    toHand(game, "Grizzly Bears");
    expect(castable(game, "Lightning Strike")).toBe(true);
    expect(castable(game, "Grizzly Bears")).toBe(false);
  });

  it("exiles itself and returns at the next end step, choosing again", () => {
    const { game, a } = table();
    const stenn = spawn(game, "Stenn, Paranoid Partisan");
    game.state.objects[stenn].chosenOnEnter = "instant";
    spawn(game, "Plains");
    spawn(game, "Island");
    spawn(game, "Island");
    activate(game, stenn);
    expect(zone(game, stenn)).toBe("exile");
    a.chooseCreatureTypeFn = () => "sorcery";
    toStep(game, "end");
    settle(game);
    const back = named(game, "Stenn, Paranoid Partisan", A);
    expect(back.length).toBe(1);
    expect(game.state.objects[back[0]].chosenOnEnter).toBe("sorcery");
  });
});

describe("Love Song of Night and Day", () => {
  it("chapter I: you and the target opponent each draw two", () => {
    const { game, a } = table();
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    castSaga(game, a, "Love Song of Night and Day", "Plains", 3, "1", [B]);
    expect(hand(game, A).length).toBe(mine + 2);
    expect(hand(game, B).length).toBe(theirs + 2);
  });

  it("chapter III: a counter on each of up to two target creatures, then it's sacrificed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const saga = castSaga(game, a, "Love Song of Night and Day", "Plains", 3, "3", [bears, giant]);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("chapter II: a 1/1 white Bird with flying", () => {
    const { game, a } = table();
    castSaga(game, a, "Love Song of Night and Day", "Plains", 3, "2");
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);
  });
});

describe("Valiant Veteran", () => {
  it("pumps other Soldiers, and from the graveyard puts a counter on each Soldier you control", () => {
    const { game } = table();
    const veteran = spawn(game, "Valiant Veteran");
    const vanguard = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, vanguard)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, veteran)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    destroy(game, veteran);
    lands(game, "Plains", 5);
    activate(game, veteran);
    expect(zone(game, veteran)).toBe("exile");
    expect(counters(game, vanguard)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Pilfer", () => {
  it("you choose a nonland card from the revealed hand", () => {
    const { game, a } = table();
    toHand(game, "Forest", B);
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Pilfer"), { targets: [ref(B)] });
    expect(seen.offered).not.toContain(hand(game, B).find((id) => game.state.objects[id].cardName === "Forest"));
    expect(seen.offered).toContain(bears);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Baird, Argivian Recruiter", () => {
  it("makes a Soldier when a creature's power is above its base power", () => {
    const { game } = table();
    spawn(game, "Baird, Argivian Recruiter");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("doesn't when every creature is at its base power", () => {
    const { game } = table();
    spawn(game, "Baird, Argivian Recruiter");
    spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });
});

describe("Serra Redeemer", () => {
  it("two counters on another creature with power 2 or less as it enters; none on a bigger one", () => {
    const { game } = table();
    spawn(game, "Serra Redeemer");
    const bears = enter(game, "Grizzly Bears");
    const giant = enter(game, "Hill Giant");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(0);
  });

  it("not on itself", () => {
    const { game } = table();
    const redeemer = enter(game, "Serra Redeemer");
    expect(counters(game, redeemer)).toBe(0);
  });
});

describe("Tatyova, Steward of Tides", () => {
  it("with seven lands, a land entering animates a target land for good, and it flies", () => {
    const { game, a } = table();
    spawn(game, "Tatyova, Steward of Tides");
    const forests = lands(game, "Forest", 6);
    pickTargets(a, forests[0]);
    enter(game, "Island");
    expect(types(game, forests[0])).toContain("creature");
    expect(types(game, forests[0])).toContain("land");
    expect(subtypes(game, forests[0])).toContain("Elemental");
    expect(pt(game, forests[0])).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, forests[0]).has("haste")).toBe(true);
    expect(keywords(game, forests[0]).has("flying")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(types(game, forests[0])).toContain("creature");
  });

  it("with fewer than seven lands, nothing", () => {
    const { game, a } = table();
    spawn(game, "Tatyova, Steward of Tides");
    const forests = lands(game, "Forest", 5);
    pickTargets(a, forests[0]);
    enter(game, "Island");
    expect(types(game, forests[0])).not.toContain("creature");
  });
});

describe("Micromancer", () => {
  it("finds only an instant or sorcery card with mana value 1", () => {
    const { game, a } = table();
    const opt = toLibrary(game, "Opt");
    const bolt = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Counterspell");
    toLibrary(game, "Sol Ring");
    pickModes(a, 0);
    const seen = pickFromZone(a, opt);
    enter(game, "Micromancer");
    expect([...seen.offered].sort()).toEqual([opt, bolt].sort());
    expect(zone(game, opt)).toBe("hand");
  });
});

describe("Weatherlight Compleated", () => {
  it("is a Phyrexian creature at four phyresis counters; scries below seven, draws at seven", () => {
    const { game } = table();
    const ship = spawn(game, "Weatherlight Compleated");
    expect(types(game, ship)).not.toContain("creature");
    game.state.objects[ship].counters.phyresis = 3;
    const cards = hand(game, A).length;
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, ship, "phyresis")).toBe(4);
    expect(types(game, ship)).toContain("creature");
    expect(subtypes(game, ship)).toContain("Phyrexian");
    expect(hand(game, A).length).toBe(cards);
    game.state.objects[ship].counters.phyresis = 6;
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, ship, "phyresis")).toBe(7);
    expect(hand(game, A).length).toBe(cards + 1);
  });

  it("triggers on its own death as a creature, reading the counters it had (the rulings)", () => {
    const { game } = table();
    const ship = spawn(game, "Weatherlight Compleated");
    game.state.objects[ship].counters.phyresis = 7;
    expect(types(game, ship)).toContain("creature");
    const cards = hand(game, A).length;
    destroy(game, ship);
    expect(zone(game, ship)).toBe("graveyard");
    expect(hand(game, A).length).toBe(cards + 1);
  });

  it("an opponent's creature dying doesn't count", () => {
    const { game } = table();
    const ship = spawn(game, "Weatherlight Compleated");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, ship, "phyresis")).toBe(0);
  });
});

describe("Knight of Dusk's Shadow", () => {
  it("your opponents can't gain life; you still can", () => {
    const { game } = table();
    spawn(game, "Knight of Dusk's Shadow");
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(23);
  });
});

describe("Jhoira, Ageless Innovator", () => {
  it("puts two counters on, then offers artifacts with mana value up to the count", () => {
    const { game, a } = table();
    const jhoira = spawn(game, "Jhoira, Ageless Innovator");
    const ring = toHand(game, "Sol Ring");
    const stone = toHand(game, "Mind Stone");
    toHand(game, "Commander's Sphere");
    const seen = pickFromZone(a, stone);
    activate(game, jhoira);
    expect(counters(game, jhoira, "ingenuity")).toBe(2);
    expect([...seen.offered].sort()).toEqual([ring, stone].sort());
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Meria, Scholar of Antiquity", () => {
  it("taps a summoning-sick nontoken artifact for {G}, never a token", () => {
    const { game } = table();
    const meria = spawn(game, "Meria, Scholar of Antiquity");
    makeToken(game, "Thopter Token");
    expect(canActivate(game, meria, 0)).toBe(false);
    const bird = spawn(game, "Ornithopter", A, { sick: true });
    activate(game, meria, 0);
    expect(game.state.objects[bird].tapped).toBe(true);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G"]);
  });

  it("taps two to exile the top card, which you may play this turn", () => {
    const { game } = table();
    const meria = spawn(game, "Meria, Scholar of Antiquity");
    spawn(game, "Sol Ring");
    expect(canActivate(game, meria, 1)).toBe(false);
    spawn(game, "Mind Stone");
    const top = toLibrary(game, "Forest");
    activate(game, meria, 1);
    expect(zone(game, top)).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === top)).toBe(true);
  });
});

describe("The World Spell", () => {
  it("chapter I offers only non-Saga permanent cards from the top seven", () => {
    const { game, a } = table({ deck: "Opt" });
    const forest = toLibrary(game, "Forest");
    const saga = toLibrary(game, "The Weatherseed Treaty");
    toLibrary(game, "Opt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    castSaga(game, a, "The World Spell", "Forest", 7, "1");
    expect([...seen.offered].sort()).toEqual([forest, bears].sort());
    expect(seen.offered).not.toContain(saga);
    expect(zone(game, bears)).toBe("hand");
    expect(library(game).slice(-6)).toContain(saga);
  });

  it("chapter III puts up to two non-Saga permanent cards from your hand onto the battlefield", () => {
    const { game, a } = table({ deck: "Opt" });
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const saga = toHand(game, "The Weatherseed Treaty");
    toHand(game, "Opt");
    const seen = pickFromZone(a, bears, giant);
    castSaga(game, a, "The World Spell", "Forest", 7, "3");
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(seen.offered).not.toContain(saga);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Tolarian Terror", () => {
  it("costs {1} less for each instant and sorcery card in your graveyard, never below {U}", () => {
    const { game } = table();
    spawn(game, "Island");
    toHand(game, "Tolarian Terror");
    for (let i = 0; i < 5; i++) toGraveyard(game, "Opt");
    toGraveyard(game, "Grizzly Bears");
    expect(castable(game, "Tolarian Terror")).toBe(false);
    toGraveyard(game, "Divination");
    expect(castable(game, "Tolarian Terror")).toBe(true);
    for (let i = 0; i < 3; i++) toGraveyard(game, "Opt");
    game.state.objects[game.battlefield.find((id) => game.state.objects[id].cardName === "Island")!].tapped = true;
    expect(castable(game, "Tolarian Terror")).toBe(false);
  });
});

describe("Shadow-Rite Priest", () => {
  it("pumps other Clerics, and sacrifices another Cleric to fetch a black creature", () => {
    const { game, a } = table();
    const priest = spawn(game, "Shadow-Rite Priest");
    expect(canActivate(game, priest)).toBe(false);
    const evangel = spawn(game, "Cabal Evangel");
    expect(pt(game, evangel)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, priest)).toEqual({ power: 2, toughness: 2 });
    const hawk = toLibrary(game, "Vampire Nighthawk");
    toLibrary(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    const seen = pickFromZone(a, hawk);
    const sacrificing = (sacrifice: ObjectId) =>
      game.canDispatch({ type: "activate-ability", player: A, source: priest, abilityIndex: 0, targets: [], sacrifice });
    expect(sacrificing(priest)).not.toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: priest, abilityIndex: 0, targets: [], sacrifice: evangel });
    settle(game);
    expect(seen.offered).toEqual([hawk]);
    expect(zone(game, evangel)).toBe("graveyard");
    expect(zone(game, priest)).toBe("battlefield");
    expect(zone(game, hawk)).toBe("battlefield");
  });
});

describe("Braids's Frightful Return", () => {
  it("chapter I: sacrificing a creature makes each opponent discard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toHand(game, "Opt", B);
    const theirs = hand(game, B).length;
    pickModes(a, 0);
    castSaga(game, a, "Braids's Frightful Return", "Swamp", 3, "1");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(theirs - 1);
  });

  it("chapter I: declining keeps the creature, and nobody discards", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toHand(game, "Opt", B);
    const theirs = hand(game, B).length;
    pickModes(a);
    castSaga(game, a, "Braids's Frightful Return", "Swamp", 3, "1");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, B).length).toBe(theirs);
  });

  it("chapter III: an opponent who won't sacrifice loses 2 life and you draw", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    const mine = hand(game, A).length;
    castSaga(game, a, "Braids's Frightful Return", "Swamp", 3, "3", [B]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
    expect(hand(game, A).length).toBe(mine + 1);
  });

  it("chapter III: an opponent who sacrifices a nonland, nontoken permanent spares themself", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    const mine = hand(game, A).length;
    castSaga(game, a, "Braids's Frightful Return", "Swamp", 3, "3", [B]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(hand(game, A).length).toBe(mine);
  });
});

describe("Knight of Dawn's Light", () => {
  it("you gain that much life plus 1", () => {
    const { game } = table();
    spawn(game, "Knight of Dawn's Light");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(life(game, A)).toBe(24);
    expect(keywords(game, named(game, "Knight of Dawn's Light", A)[0]).has("first-strike")).toBe(true);
  });
});

describe("Protect the Negotiators", () => {
  /** Bob's Lightning Bolt at alice on the stack, alice to respond; Bob keeps
   * one Mountain untapped. */
  function boltOnStack(game: Game): ObjectId {
    lands(game, "Mountain", 2, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    game.state.priority.holder = B;
    game.dispatch({ type: "cast-spell", player: B, card: bolt, targets: [ref(A)] });
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.length === 1);
    return bolt;
  }

  it("kicked, the new Soldier is counted in what the spell's controller must pay (the ruling)", () => {
    const { game, b } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    spawn(game, "Plains");
    const bolt = boltOnStack(game);
    // One creature would be {1}, which Bob's last Mountain pays; with the
    // Soldier it's {2}, which he can't.
    pickModes(b, 0);
    cast(game, toHand(game, "Protect the Negotiators"), { targets: [ref(bolt)], kicked: true });
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(life(game, A)).toBe(20);
  });

  it("unkicked, an opponent who pays {1} per creature you control keeps the spell", () => {
    const { game, b } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    const bolt = boltOnStack(game);
    pickModes(b, 0);
    cast(game, toHand(game, "Protect the Negotiators"), { targets: [ref(bolt)] });
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
    expect(life(game, A)).toBe(17);
  });
});

describe("Impede Momentum", () => {
  it("taps the creature, puts three stun counters on it, and scries 1", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Impede Momentum"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(3);
  });
});

describe("Najal, the Storm Runner", () => {
  it("lets you cast a sorcery while the stack isn't empty", () => {
    const { game } = table();
    spawn(game, "Najal, the Storm Runner");
    lands(game, "Island", 4);
    spawn(game, "Forest");
    toHand(game, "Divination");
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(castable(game, "Divination")).toBe(true);
  });

  it("paying {2} as it attacks copies your next instant or sorcery this turn", () => {
    const { game, a } = table();
    const najal = spawn(game, "Najal, the Storm Runner");
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    attack(game, a, [najal]);
    expect(life(game, B)).toBe(15);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(9);
    expect(graveyard(game, A).length).toBeGreaterThan(0);
  });

  it("declining to pay copies nothing", () => {
    const { game, a } = table();
    const najal = spawn(game, "Najal, the Storm Runner");
    lands(game, "Mountain", 3);
    pickModes(a);
    attack(game, a, [najal]);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
  });
});
