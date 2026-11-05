/**
 * Batch 261, group B: cards freed by the need-keys families (cost reductions,
 * tap-X costs, emblems, look-and-choose set rules, exile links, life totals
 * set). One test for the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
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
  tokensNamed,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId, targets: readonly (PlayerId | ObjectId)[] = [], player: PlayerId = A): boolean =>
  game.canDispatch({ type: "cast-spell", player, card, targets: targets.map(ref) } as Action) === null;
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const addCounter = (game: Game, id: ObjectId, counter: string, amount = 1): void =>
  game.debugApplyEffect(controller(game, id), { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);
/** Answer the `may` waiting on `player` with X (a `{X}` cost or "any amount of {E}"). */
function answerX(game: Game, x: number, player: PlayerId = A): void {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
  game.dispatch({ type: "choose-modes", player, modes: [0], xValue: x } as Action);
  settle(game);
}
type AbilityOffer = Extract<LegalAction, { kind: "activate-ability" }>;
const offersFor = (game: Game, card: ObjectId): readonly AbilityOffer[] =>
  game.legalActions(A).filter((a): a is AbilityOffer => a.kind === "activate-ability" && a.source === card);
/** Put a transforming double-faced card onto the battlefield back face up. */
function backFace(game: Game, front: string, player: PlayerId = A): ObjectId {
  const card = toGraveyard(game, front, player);
  game.debugApplyEffect(player, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
  settle(game);
  return card;
}

describe("Glamdring, Foe-hammer", () => {
  it("instants and sorceries cost {X} less, X the equipped creature's power", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const glamdring = spawn(game, "Glamdring, Foe-hammer");
    lands(game, "Island", 1);
    const divination = toHand(game, "Divination");
    expect(castable(game, divination)).toBe(false);
    lands(game, "Wastes", 2);
    activate(game, glamdring, 0, { targets: [ref(giant)] });
    expect(castable(game, divination)).toBe(true);
  });
});

describe("Korvold, Gleeful Glutton", () => {
  it("X counts the permanent types among graveyard cards, an instant not among them", () => {
    const { game, a } = table();
    const korvold = spawn(game, "Korvold, Gleeful Glutton");
    for (const name of ["Grizzly Bears", "Wastes", "Sol Ring", "Shock", "Ornithopter"]) toGraveyard(game, name);
    const before = hand(game).length;
    attack(game, a, [korvold]);
    expect(counters(game, korvold)).toBe(3);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Golden-Tail Trainer", () => {
  it("pumps other modified creatures by its power, not unmodified ones", () => {
    const { game, a } = table();
    const trainer = spawn(game, "Golden-Tail Trainer");
    addCounter(game, trainer, "+1/+1");
    const modded = spawn(game, "Grizzly Bears");
    addCounter(game, modded, "+1/+1");
    const plain = spawn(game, "Savannah Lions");
    attack(game, a, [trainer]);
    expect(pt(game, modded)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Valor's Flagship", () => {
  it("cycled for X = 2 makes two Pilots", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const flagship = toHand(game, "Valor's Flagship");
    const offer = offersFor(game, flagship).find((o) => o.text.startsWith("Cycling"));
    expect(offer).toBeDefined();
    activate(game, flagship, offer!.abilityIndex, { x: 2 });
    expect(tokensNamed(game, "Pilot Token", A)).toBe(2);
  });
});

describe("Soul Exchange", () => {
  it("puts a +2/+2 counter on the creature only when the exiled one was a Thrull", () => {
    for (const [exiled, size] of [["Basal Thrull", 4], ["Savannah Lions", 2]] as const) {
      const { game } = table();
      lands(game, "Swamp", 2);
      const fodder = spawn(game, exiled);
      const dead = toGraveyard(game, "Grizzly Bears");
      cast(game, toHand(game, "Soul Exchange"), { targets: [ref(dead)], sacrifice: fodder });
      expect(zone(game, fodder)).toBe("exile");
      const [bears] = named(game, "Grizzly Bears");
      expect(pt(game, bears)).toEqual({ power: size, toughness: size });
    }
  });
});

describe("Visions of Duplicity", () => {
  it("exchanges two creatures you don't control", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", C);
    cast(game, toHand(game, "Visions of Duplicity"), { targets: [ref(bears), ref(giant)] });
    expect(controller(game, bears)).toBe(C);
    expect(controller(game, giant)).toBe(B);
  });
});

describe("Visions of Ruin", () => {
  it("a Treasure for each artifact the opponents sacrificed", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 4);
    spawn(game, "Sol Ring", B);
    spawn(game, "Mind Stone", C);
    cast(game, toHand(game, "Visions of Ruin"));
    expect(named(game, "Sol Ring")).toEqual([]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});

describe("Lich-Knights' Conquest", () => {
  it("returns as many creature cards as it sacrificed, chosen", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const rings = [spawn(game, "Sol Ring"), spawn(game, "Mind Stone")];
    const dead = ["Grizzly Bears", "Hill Giant", "Savannah Lions"].map((n) => toGraveyard(game, n));
    a.choosePermanentsFn = () => rings;
    a.chooseFromZoneFn = (_v, eligible) => eligible.filter((id) => id !== dead[1]).slice(0, 2);
    cast(game, toHand(game, "Lich-Knights' Conquest"));
    expect(rings.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(named(game, "Grizzly Bears").length + named(game, "Savannah Lions").length).toBe(2);
    expect(named(game, "Hill Giant")).toEqual([]);
  });
});

describe("Belisarius Cawl", () => {
  it("Master of Machines looks at the top X, X the creatures tapped", () => {
    const { game, a } = table();
    const cawl = spawn(game, "Belisarius Cawl");
    const helpers = [spawn(game, "Grizzly Bears"), spawn(game, "Savannah Lions")];
    toLibrary(game, "Wastes");
    const ring = toLibrary(game, "Sol Ring");
    a.chooseFromZoneFn = (_v, eligible) => eligible.filter((id) => id === ring);
    game.dispatch({ type: "activate-ability", player: A, source: cawl, abilityIndex: 1, targets: [], xValue: 2, tap: helpers } as Action);
    settle(game);
    expect(zone(game, ring)).toBe("hand");
    expect(helpers.every((id) => tapped(game, id))).toBe(true);
  });
});

describe("Glacian, Powerstone Engineer", () => {
  it("one of the top X into the hand, the rest into the graveyard", () => {
    const { game, a } = table();
    const glacian = spawn(game, "Glacian, Powerstone Engineer");
    const rocks = [spawn(game, "Sol Ring"), spawn(game, "Mind Stone")];
    const second = toLibrary(game, "Hill Giant");
    const first = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = () => [first];
    game.dispatch({ type: "activate-ability", player: A, source: glacian, abilityIndex: 0, targets: [], xValue: 2, tap: rocks } as Action);
    settle(game);
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Resonance Technician", () => {
  it("copies only a spell whose mana value is the X tapped for", () => {
    const { game } = table();
    const tech = spawn(game, "Resonance Technician");
    const rocks = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const activation = (x: number): Action =>
      ({ type: "activate-ability", player: A, source: tech, abilityIndex: 0, targets: [ref(divination)], xValue: x, tap: rocks.slice(0, x) }) as Action;
    expect(game.canDispatch(activation(2))).not.toBeNull();
    expect(game.canDispatch(activation(3))).toBeNull();
  });
});

describe("Charix, the Raging Isle", () => {
  it("gets +X/-X, X the Islands you control", () => {
    const { game } = table();
    const charix = spawn(game, "Charix, the Raging Isle");
    lands(game, "Island", 3);
    activate(game, charix, 0);
    expect(pt(game, charix)).toEqual({ power: 3, toughness: 14 });
  });
});

describe("Syr Elenora, the Discerning", () => {
  it("has power equal to the cards in your hand", () => {
    const { game } = table();
    const elenora = spawn(game, "Syr Elenora, the Discerning");
    expect(pt(game, elenora).power).toBe(hand(game).length);
  });
});

describe("Pursued Whale", () => {
  it("each opponent gets a Pirate that makes their creatures attack", () => {
    const { game } = table({ players: 3 });
    enter(game, "Pursued Whale");
    expect(tokensNamed(game, "Pirate Token (Can't Block, Creatures Attack)", B)).toBe(1);
    expect(tokensNamed(game, "Pirate Token (Can't Block, Creatures Attack)", C)).toBe(1);
    expect(tokensNamed(game, "Pirate Token (Can't Block, Creatures Attack)", A)).toBe(0);
  });
});

describe("Galvanic Discharge", () => {
  it("deals as much damage as energy paid", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Galvanic Discharge"), { targets: [ref(giant)], settle: false });
    answerX(game, 3);
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.players[A].energy ?? 0).toBe(0);
  });
});

describe("Well of Lost Dreams", () => {
  it("pays X up to the life gained and draws X", () => {
    const { game } = table();
    spawn(game, "Well of Lost Dreams");
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    expect(game.canDispatch({ type: "choose-modes", player: A, modes: [0], xValue: 4 } as Action)).not.toBeNull();
    answerX(game, 2);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Tyvar, Jubilant Brawler", () => {
  it("−2 mills three, then may return a creature card with mana value 2 or less", () => {
    const { game, a } = table();
    const tyvar = spawn(game, "Tyvar, Jubilant Brawler");
    const lions = toGraveyard(game, "Savannah Lions");
    toGraveyard(game, "Hill Giant");
    a.chooseFromZoneFn = (_v, eligible) => {
      expect(eligible).toContain(lions);
      expect(eligible.every((id) => game.state.objects[id].cardName !== "Hill Giant")).toBe(true);
      return [lions];
    };
    loyalty(game, tyvar, -2);
    expect(zone(game, lions)).toBe("battlefield");
  });
});

describe("Archon of Emeria", () => {
  it("lets each player cast only one spell a turn", () => {
    const { game } = table();
    spawn(game, "Archon of Emeria");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(castable(game, toHand(game, "Shock"), [B])).toBe(false);
  });
});

describe("Orcish Mine", () => {
  it("the last ore counter destroys the land and deals 2 to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const land = spawn(game, "Wastes", B);
    const mine = toHand(game, "Orcish Mine");
    cast(game, mine, { targets: [ref(land)] });
    expect(counters(game, mine, "ore")).toBe(3);
    game.state.objects[mine].counters.ore = 1;
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(land)]);
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Living Breakthrough", () => {
  it("opponents can't cast spells with that mana value until your next turn", () => {
    const { game } = table();
    backFace(game, "Inventive Iteration");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const bShock = toHand(game, "Shock", B);
    const bDivination = toHand(game, "Divination", B);
    lands(game, "Island", 3, B);
    nextTurn(game);
    expect(castable(game, bShock, [A], B)).toBe(false);
    expect(castable(game, bDivination, [], B)).toBe(true);
  });
});

describe("Goblin Kaboomist", () => {
  it("makes a Land Mine at your upkeep", () => {
    const { game } = table();
    spawn(game, "Goblin Kaboomist");
    nextTurn(game);
    toStep(game, "draw");
    expect(tokensNamed(game, "Land Mine Token", A)).toBe(1);
  });
});

describe("Sunflare Shaman", () => {
  it("deals X to the target and X to itself, X the Elemental cards in your graveyard", () => {
    const { game } = table();
    const shaman = spawn(game, "Sunflare Shaman");
    toGraveyard(game, "Sunflare Shaman");
    toGraveyard(game, "Sunflare Shaman");
    lands(game, "Mountain", 2);
    activate(game, shaman, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, shaman)).toBe("graveyard");
  });
});

describe("Amalia Benavides Aguirre", () => {
  it("explores to exactly 20 power and destroys every other creature", () => {
    const { game } = table();
    const amalia = spawn(game, "Amalia Benavides Aguirre");
    addCounter(game, amalia, "+1/+1", 17);
    const bears = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(pt(game, amalia).power).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, amalia)).toBe("battlefield");
  });
});

describe("Magister of Worth", () => {
  it("condemnation destroys every creature but it", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickModes(b, 1);
    const magister = enter(game, "Magister of Worth");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, magister)).toBe("battlefield");
  });
  it("grace returns each player's creature cards", () => {
    const { game, a, b } = table();
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Hill Giant", B);
    pickModes(a, 0);
    pickModes(b, 0);
    enter(game, "Magister of Worth");
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Myojin of Cleansing Fire", () => {
  it("removes its divinity counter to destroy all other creatures", () => {
    const { game } = table();
    const myojin = spawn(game, "Myojin of Cleansing Fire");
    addCounter(game, myojin, "divinity");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, myojin, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, myojin)).toBe("battlefield");
  });
});

describe("Homarid Warrior", () => {
  it("taps and stays tapped through your next untap step", () => {
    const { game } = table();
    const homarid = spawn(game, "Homarid Warrior");
    lands(game, "Island", 1);
    activate(game, homarid, 0);
    expect(tapped(game, homarid)).toBe(true);
    expect(keywords(game, homarid).has("shroud")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, homarid)).toBe(true);
  });
});

describe("Deep Spawn", () => {
  it("is sacrificed at upkeep unless you mill two", () => {
    for (const mill of [true, false]) {
      const { game, a } = table();
      const spawnId = spawn(game, "Deep Spawn");
      if (mill) pickModes(a, 0);
      else pickModes(a);
      const before = graveyard(game).length;
      nextTurn(game);
      nextTurn(game);
      expect(zone(game, spawnId)).toBe(mill ? "battlefield" : "graveyard");
      if (mill) expect(graveyard(game).length).toBe(before + 2);
    }
  });
});

describe("Entropic Battlecruiser", () => {
  it("at 1+ an opponent's discard costs them 3 life", () => {
    const { game } = table();
    const ship = spawn(game, "Entropic Battlecruiser");
    addCounter(game, ship, "charge");
    game.debugApplyEffect(B, { kind: "discard", target: "you", amount: 1 }, []);
    settle(game);
    expect(life(game, B)).toBe(17);
  });
});

describe("Urza's Sylex", () => {
  it("each player keeps six lands and the rest of the permanents are destroyed", () => {
    const { game, a } = table();
    const sylex = spawn(game, "Urza's Sylex");
    lands(game, "Plains", 4);
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    a.choosePermanentsFn = (_v, eligible) => eligible.slice(0, 6);
    activate(game, sylex, 0);
    expect(zone(game, sylex)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.battlefield.filter((id) => controller(game, id) === A).length).toBe(6);
  });
});

describe("Teferi's Talent", () => {
  it("a draw puts a loyalty counter on the enchanted planeswalker", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    lands(game, "Island", 5);
    cast(game, toHand(game, "Teferi's Talent"), { targets: [ref(jace)] });
    const before = counters(game, jace, "loyalty");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(counters(game, jace, "loyalty")).toBe(before + 1);
  });
});

describe("Wrenn and Seven", () => {
  it("0 puts lands from hand tapped; −3's Treefolk is as big as your lands", () => {
    const { game, a } = table();
    const wrenn = spawn(game, "Wrenn and Seven");
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 3);
    loyalty(game, wrenn, 0);
    const mine = game.battlefield.filter((id) => controller(game, id) === A && game.state.objects[id].cardName === "Wastes");
    expect(mine.length).toBe(3);
    expect(mine.every((id) => tapped(game, id))).toBe(true);
    nextTurn(game);
    nextTurn(game);
    loyalty(game, wrenn, -3);
    const [treefolk] = named(game, "Treefolk Token (Reach, Lands)");
    expect(pt(game, treefolk)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Wrenn and Realmbreaker", () => {
  it("−7's emblem plays lands and casts permanent spells from the graveyard", () => {
    const { game } = table();
    const wrenn = spawn(game, "Wrenn and Realmbreaker");
    loyalty(game, wrenn, -7, { atLeast: 7 });
    const wastes = toGraveyard(game, "Wastes");
    const shock = toGraveyard(game, "Shock");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const actions = game.legalActions(A);
    expect(actions.some((x) => x.kind === "play-land" && x.card === wastes)).toBe(true);
    expect(actions.some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(true);
    expect(actions.some((x) => x.kind === "cast-spell" && x.card === shock)).toBe(false);
  });
});

describe("Teferi Akosa of Zhalfir", () => {
  it("−3: X is the creatures tapped as it resolves, the target's mana value at most X", () => {
    const { game, a } = table();
    const teferi = backFace(game, "Invasion of New Phyrexia");
    const tappers = [spawn(game, "Grizzly Bears"), spawn(game, "Savannah Lions")];
    const stone = spawn(game, "Mind Stone", B);
    const giant = spawn(game, "Hill Giant", B);
    a.choosePermanentsFn = () => tappers;
    watchTargets(a, () => [giant]);
    game.state.objects[teferi].counters.loyalty = 4;
    activate(game, teferi, 2);
    // X = 2: the Hill Giant (mana value 4) isn't a legal target, so the Mind
    // Stone is the only one.
    expect(tappers.every((id) => tapped(game, id))).toBe(true);
    expect(zone(game, stone)).toBe("library");
    expect(zone(game, giant)).toBe("battlefield");
  });
  it("−2's emblem: Knights get +1/+0 and ward {1}", () => {
    const { game } = table();
    const teferi = backFace(game, "Invasion of New Phyrexia");
    const knight = spawn(game, "White Knight");
    game.state.objects[teferi].counters.loyalty = 4;
    activate(game, teferi, 1);
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 2 });
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Hypnox", () => {
  it("cast from hand, exiles the opponent's hand until it leaves", () => {
    const { game, a } = table();
    lands(game, "Swamp", 11);
    pickTargets(a, B);
    const hypnox = toHand(game, "Hypnox");
    cast(game, hypnox);
    const exiled = game.state.zones.shared.exile.filter((id) => game.state.objects[id].owner === B);
    expect(hand(game, B).length).toBe(0);
    destroy(game, hypnox);
    expect(exiled.map((id) => zone(game, id))).toEqual(exiled.map(() => "hand"));
    expect(hand(game, B).length).toBe(exiled.length);
  });
});

describe("Mesmeric Fiend", () => {
  it("exiles a chosen nonland card, returned when it leaves", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [bolt];
    const fiend = enter(game, "Mesmeric Fiend");
    expect(zone(game, bolt)).toBe("exile");
    destroy(game, fiend);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Wormfang Behemoth", () => {
  it("exiles your hand, which comes back when it leaves", () => {
    const { game } = table();
    const before = hand(game).length;
    const behemoth = enter(game, "Wormfang Behemoth");
    expect(hand(game).length).toBe(0);
    destroy(game, behemoth);
    expect(hand(game).length).toBe(before);
  });
});

describe("Mystical Tether", () => {
  it("exiles an opponent's creature until it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const tether = enter(game, "Mystical Tether");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, tether);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });
});

describe("Jaya's Immolating Inferno", () => {
  it("needs a legendary creature or planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const inferno = toHand(game, "Jaya's Immolating Inferno");
    const offer = (): boolean =>
      game.canDispatch({ type: "cast-spell", player: A, card: inferno, targets: [ref(B), null, null], xValue: 1 } as Action) === null;
    expect(offer()).toBe(false);
    spawn(game, "Syr Elenora, the Discerning");
    expect(offer()).toBe(true);
  });
});

describe("Shaman of Forgotten Ways", () => {
  it("formidable: each life total becomes the creatures its player controls", () => {
    const { game } = table();
    const shaman = spawn(game, "Shaman of Forgotten Ways");
    lands(game, "Forest", 11);
    spawn(game, "Grizzly Bears", B);
    expect(offersFor(game, shaman).some((o) => o.abilityIndex === 1)).toBe(false);
    for (let i = 0; i < 3; i++) spawn(game, "Hill Giant");
    activate(game, shaman, 1);
    expect(life(game, A)).toBe(4);
    expect(life(game, B)).toBe(1);
  });
});

describe("Torgaar, Famine Incarnate", () => {
  it("costs {2} less per creature sacrificed; the target's life becomes half the starting total", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Savannah Lions")];
    a.chooseSacrificesFn = () => fodder;
    pickTargets(a, B);
    const torgaar = toHand(game, "Torgaar, Famine Incarnate");
    game.dispatch({ type: "cast-spell", player: A, card: torgaar, xValue: 2, targets: [] } as Action);
    settle(game);
    expect(zone(game, torgaar)).toBe("battlefield");
    expect(fodder.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(life(game, B)).toBe(10);
  });
});

describe("Vraska, Relic Seeker", () => {
  it("−10 sets the target's life to 1", () => {
    const { game } = table();
    const vraska = spawn(game, "Vraska, Relic Seeker");
    loyalty(game, vraska, -10, { atLeast: 10, targets: [ref(B)] });
    expect(life(game, B)).toBe(1);
  });
});

describe("Elspeth Resplendent", () => {
  it("+1 puts a +1/+1 counter and the chosen keyword counter", () => {
    const { game, a } = table();
    const elspeth = spawn(game, "Elspeth Resplendent");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    loyalty(game, elspeth, 1, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, bears, "lifelink")).toBe(1);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
  it("−3's permanent enters with a shield counter", () => {
    const { game, a } = table();
    const elspeth = spawn(game, "Elspeth Resplendent");
    const lions = toLibrary(game, "Savannah Lions");
    a.chooseFromZoneFn = () => [lions];
    loyalty(game, elspeth, -3);
    const [entered] = named(game, "Savannah Lions");
    expect(counters(game, entered, "shield")).toBe(1);
  });
});

describe("Wakanda Forever!", () => {
  it("one onto the battlefield with an indestructible counter, one to hand, the rest to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const shock = toLibrary(game, "Shock");
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const picks = [[bears], [giant]];
    a.chooseFromZoneFn = () => picks.shift() ?? [];
    cast(game, toHand(game, "Wakanda Forever!"));
    const [entered] = named(game, "Grizzly Bears");
    expect(counters(game, entered, "indestructible")).toBe(1);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, shock)).toBe("graveyard");
  });
});

describe("Ao, the Dawn Sky", () => {
  it("its counters mode reaches creatures and Vehicles you control", () => {
    const { game, a } = table();
    const ao = spawn(game, "Ao, the Dawn Sky");
    const bears = spawn(game, "Grizzly Bears");
    const flagship = spawn(game, "Valor's Flagship");
    pickModes(a, 1);
    destroy(game, ao);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, flagship)).toBe(2);
  });
});

describe("Eivor, Wolf-Kissed", () => {
  it("mills the damage dealt and may put a land from among them onto the battlefield", () => {
    const { game, a } = table();
    const eivor = spawn(game, "Eivor, Wolf-Kissed");
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    const landsBefore = game.battlefield.filter((id) => controller(game, id) === A).length;
    const graveBefore = graveyard(game).length;
    attack(game, a, [eivor]);
    expect(graveyard(game).length).toBe(graveBefore + 6);
    expect(game.battlefield.filter((id) => controller(game, id) === A).length).toBe(landsBefore + 1);
  });
});

describe("Revival Experiment", () => {
  it("returns one card a permanent type and costs 3 life each", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    lands(game, "Forest", 1);
    const cards = ["Grizzly Bears", "Wastes", "Sol Ring"].map((n) => toGraveyard(game, n));
    a.chooseFromZoneFn = () => cards;
    const experiment = toHand(game, "Revival Experiment");
    cast(game, experiment);
    expect(cards.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield", "battlefield"]);
    expect(life(game)).toBe(11);
    expect(zone(game, experiment)).toBe("exile");
  });
});

describe("Sludge Titan", () => {
  it("mills five and may take a creature and a land", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_v, eligible) => [bears, ...eligible.filter((id) => id !== bears).slice(0, 1)];
    const before = hand(game).length;
    enter(game, "Sludge Titan");
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Druidic Ritual", () => {
  it("returns up to one creature card and up to one land card", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    const wastes = toGraveyard(game, "Wastes");
    pickModes(a);
    a.chooseFromZoneFn = () => [bears, wastes];
    cast(game, toHand(game, "Druidic Ritual"));
    expect([zone(game, bears), zone(game, wastes), zone(game, lions)]).toEqual(["hand", "hand", "graveyard"]);
  });
});

describe("Yuna's Decision", () => {
  it("Continue the Pilgrimage: sacrifice, draw, then a creature and a land from hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const fodder = spawn(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    a.chooseSacrificesFn = () => [fodder];
    a.chooseFromZoneFn = (_v, eligible) => [giant, ...eligible.filter((id) => game.state.objects[id].cardName === "Wastes").slice(0, 1)];
    cast(game, toHand(game, "Yuna's Decision"), { modes: [0] });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Elminster", () => {
  it("a scry makes the next instant or sorcery cost {X} less", () => {
    const { game } = table();
    const elminster = spawn(game, "Elminster");
    loyalty(game, elminster, 2);
    lands(game, "Island", 1);
    expect(castable(game, toHand(game, "Divination"))).toBe(true);
  });
});

describe("Invasion of New Phyrexia", () => {
  it("makes X Knights", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const invasion = toHand(game, "Invasion of New Phyrexia");
    game.dispatch({ type: "cast-spell", player: A, card: invasion, xValue: 2, targets: [] } as Action);
    settle(game);
    expect(tokensNamed(game, "Knight Token (Chivalric Alliance)", A)).toBe(2);
  });
});
