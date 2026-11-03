/**
 * `grantsActivatedOf` over exiled cards: every card in exile matching (Rex,
 * Mairsil), the cards exiled with this permanent (Hazel's Brewmaster, Agatha's
 * Soul Cauldron, Idris), the last one chosen (Koh); `withTriggered`, a card's
 * triggered abilities too (Idris, Koh); `onceEach`, each ability once a turn
 * (Mairsil); and what rides on them: `grantPtPerCount.exiledWithSourceManaValue`,
 * `spendManaAs.activatingOf`, `return-from-graveyard`'s `"exile"`.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  counters,
  enter,
  graveyard,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

const offers = (game: Game, id: ObjectId, player: PlayerId = A): Activate[] =>
  game.legalActions(player).filter((a): a is Activate => a.kind === "activate-ability" && a.source === id);
const texts = (game: Game, id: ObjectId, player: PlayerId = A): string[] => [
  ...new Set(offers(game, id, player).map((a) => a.text)),
];
const indexOf = (game: Game, id: ObjectId, text: string): number => {
  const found = offers(game, id).find((a) => a.text.startsWith(text));
  if (found === undefined) throw new Error(`no "${text}" offered`);
  return found.abilityIndex;
};
/** Exile `name`, linked to `source`'s stint, as a `linked` exile does. */
const exiledWith = (game: Game, source: ObjectId, name: string, owner: PlayerId = B): ObjectId => {
  const card = toExile(game, name, owner);
  game.state.objects[card].exiledWith = { source, zoneChangeCount: game.state.objects[source].zoneChangeCount ?? 0 };
  return card;
};

/** Destroy `id` by an effect, and settle. */
const kill = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
  settle(game);
};

const FANATIC = "Sacrifice this creature: It deals 1 damage to any target.";
const ELVES_MANA = "{T}: Add {G}.";
const SHADE = "{B}: This creature gets +1/+1 until end of turn.";

describe("zone: exile — every card in exile matching", () => {
  it("Rex exiles a creature card from any graveyard with a brain counter, and has its abilities", () => {
    const { game } = table();
    const rex = spawn(game, "Rex, Cyber-Hound");
    const fanatic = toGraveyard(game, "Mogg Fanatic", B);
    game.state.players[A].energy = 2;
    expect(texts(game, rex)).not.toContain(FANATIC);
    activate(game, rex, 0, { targets: [ref(fanatic)] });
    expect(zone(game, fanatic)).toBe("exile");
    expect(counters(game, fanatic, "brain")).toBe(1);
    expect(game.state.players[A].energy).toBe(0);
    expect(texts(game, rex)).toContain(FANATIC);
    // "Sacrifice Mogg Fanatic" sacrifices Rex (rule 201.5b).
    activate(game, rex, indexOf(game, rex, "Sacrifice"), { targets: [ref(B)] });
    expect(zone(game, rex)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("Rex reads a brain counter however it got there, and no other card in exile", () => {
    const { game } = table();
    const rex = spawn(game, "Rex, Cyber-Hound");
    const elves = toExile(game, "Llanowar Elves", B);
    expect(texts(game, rex)).not.toContain(ELVES_MANA);
    game.state.objects[elves].counters.brain = 1;
    expect(texts(game, rex)).toContain(ELVES_MANA);
  });

  it("Rex's combat damage mills that player and gets you two energy", () => {
    const { game, a } = table();
    const rex = spawn(game, "Rex, Cyber-Hound");
    attack(game, a, [rex]);
    expect(graveyard(game, B)).toHaveLength(2);
    expect(game.state.players[A].energy).toBe(2);
  });

  it("Mairsil exiles from the hand with a cage counter, and reads only cards you own", () => {
    const { game, a } = table();
    const fromHand = toHand(game, "Mogg Fanatic", A);
    const fromYard = toGraveyard(game, "Llanowar Elves", A);
    pickModes(a, 0);
    const seen = pickFromZone(a, fromHand);
    const mairsil = enter(game, "Mairsil, the Pretender", A);
    expect(seen.offered).toEqual(expect.arrayContaining([fromHand, fromYard]));
    expect(zone(game, fromHand)).toBe("exile");
    expect(counters(game, fromHand, "cage")).toBe(1);
    expect(zone(game, fromYard)).toBe("graveyard");
    expect(texts(game, mairsil)).toContain(FANATIC);
    const theirs = toExile(game, "Llanowar Elves", B);
    game.state.objects[theirs].counters.cage = 1;
    expect(texts(game, mairsil)).not.toContain(ELVES_MANA);
  });

  it("Mairsil takes the graveyard's card with none in hand, and may decline", () => {
    const { game, a } = table();
    const elves = toGraveyard(game, "Llanowar Elves", A);
    pickModes(a);
    const first = enter(game, "Mairsil, the Pretender", A);
    expect(zone(game, elves)).toBe("graveyard");
    expect(first).toBeDefined();
    pickModes(a, 0);
    enter(game, "Mairsil, the Pretender", A);
    expect(zone(game, elves)).toBe("exile");
    expect(counters(game, elves, "cage")).toBe(1);
  });

  it("Mairsil may activate each ability once a turn: each card's its own, and again next turn", () => {
    const { game } = table();
    const mairsil = spawn(game, "Mairsil, the Pretender");
    lands(game, "Swamp", 6);
    const first = toExile(game, "Frozen Shade", A);
    game.state.objects[first].counters.cage = 1;
    const second = toExile(game, "Frozen Shade", A);
    game.state.objects[second].counters.cage = 1;
    expect(offers(game, mairsil).filter((o) => o.text === SHADE)).toHaveLength(2);
    activate(game, mairsil, indexOf(game, mairsil, SHADE));
    expect(pt(game, mairsil).power).toBe(5);
    expect(offers(game, mairsil).filter((o) => o.text === SHADE)).toHaveLength(1);
    activate(game, mairsil, indexOf(game, mairsil, SHADE));
    expect(pt(game, mairsil).power).toBe(6);
    expect(texts(game, mairsil)).not.toContain(SHADE);
    nextTurn(game);
    nextTurn(game);
    expect(offers(game, mairsil).filter((o) => o.text === SHADE)).toHaveLength(2);
  });

  it("a card leaving exile doesn't move Mairsil's limit onto another card's ability", () => {
    const { game } = table();
    const mairsil = spawn(game, "Mairsil, the Pretender");
    lands(game, "Swamp", 6);
    const first = toExile(game, "Frozen Shade", A);
    game.state.objects[first].counters.cage = 1;
    const second = toExile(game, "Llanowar Elves", A);
    game.state.objects[second].counters.cage = 1;
    activate(game, mairsil, indexOf(game, mairsil, SHADE));
    expect(texts(game, mairsil)).not.toContain(SHADE);
    // The Shade's card goes; the Elves' ability takes its place in the list.
    game.state.objects[first].counters.cage = 0;
    expect(texts(game, mairsil)).toContain(ELVES_MANA);
  });
});

describe("zone: exiled-with — the cards exiled with this permanent", () => {
  it("Hazel's Brewmaster: Foods have its exiled creature cards' abilities, not its other cards'", () => {
    const { game, a } = table();
    const land = toGraveyard(game, "Strip Mine", B);
    pickTargets(a, land);
    const brewmaster = enter(game, "Hazel's Brewmaster", A);
    expect(zone(game, land)).toBe("exile");
    expect(game.state.objects[land].exiledWith?.source).toBe(brewmaster);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    const food = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Food Token")!;
    game.state.objects[food].summoningSick = false;
    // A land card isn't a creature card.
    expect(texts(game, food).some((t) => t.includes("Destroy target land"))).toBe(false);
    exiledWith(game, brewmaster, "Mogg Fanatic");
    expect(texts(game, food)).toContain(FANATIC);
    // Foods only.
    expect(texts(game, brewmaster)).not.toContain(FANATIC);
    // Another permanent's exiled card isn't read.
    const bear = spawn(game, "Grizzly Bears");
    exiledWith(game, bear, "Llanowar Elves");
    expect(texts(game, food)).not.toContain(ELVES_MANA);
    // "Sacrifice Mogg Fanatic" sacrifices the Food.
    activate(game, food, indexOf(game, food, "Sacrifice"), { targets: [ref(B)] });
    expect(zone(game, brewmaster)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
  });

  it("Hazel's Brewmaster exiles when it attacks too, and a Food reads nothing once it's gone", () => {
    const { game, a } = table();
    const brewmaster = spawn(game, "Hazel's Brewmaster");
    const fanatic = toGraveyard(game, "Mogg Fanatic", B);
    pickTargets(a, fanatic);
    attack(game, a, [brewmaster]);
    expect(zone(game, fanatic)).toBe("exile");
    const food = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Food Token")!;
    game.state.objects[food].summoningSick = false;
    expect(texts(game, food)).toContain(FANATIC);
  });

  it("Agatha's Soul Cauldron: a counter only for a creature card, its abilities only for creatures with one", () => {
    const { game, a } = table();
    const cauldron = spawn(game, "Agatha's Soul Cauldron");
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const land = toGraveyard(game, "Strip Mine", B);
    activate(game, cauldron, 0, { targets: [ref(land)] });
    expect(zone(game, land)).toBe("exile");
    expect(counters(game, bear)).toBe(0);
    game.state.objects[cauldron].tapped = false;
    const elves = toGraveyard(game, "Llanowar Elves", B);
    pickTargets(a, bear);
    activate(game, cauldron, 0, { targets: [ref(elves)] });
    expect(counters(game, bear)).toBe(1);
    expect(texts(game, bear)).toContain(ELVES_MANA);
    expect(texts(game, other)).not.toContain(ELVES_MANA);
    // The land exiled with it isn't a creature card.
    expect(texts(game, bear).some((t) => t.includes("Destroy target land"))).toBe(false);
  });

  it("Agatha's Soul Cauldron pays for a creature's abilities with any colour, and not an artifact's", () => {
    const { game } = table();
    spawn(game, "Agatha's Soul Cauldron");
    const shade = spawn(game, "Frozen Shade");
    const pestilence = spawn(game, "Pestilence");
    lands(game, "Mountain", 1);
    // {B} from a Mountain: only with the Cauldron, and only for the creature.
    expect(texts(game, shade)).toContain(SHADE);
    expect(offers(game, pestilence)).toEqual([]);
    activate(game, shade, 0);
    expect(pt(game, shade).power).toBe(1);
  });

  it("without the Cauldron, a Mountain can't pay {B}", () => {
    const { game } = table();
    const shade = spawn(game, "Frozen Shade");
    lands(game, "Mountain", 1);
    expect(texts(game, shade)).not.toContain(SHADE);
  });

  it("Idris exiles another artifact, gets +X/+X and its abilities, and gives it back on leaving", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone");
    const bystander = spawn(game, "Altar of the Brood");
    const seen = pickPermanents(a, stone);
    const idris = enter(game, "Idris, Soul of the TARDIS");
    expect(seen.offered).toEqual(expect.arrayContaining([stone, bystander]));
    expect(seen.offered).not.toContain(idris);
    expect(zone(game, stone)).toBe("exile");
    expect(counters(game, idris, "time")).toBe(3);
    expect(pt(game, idris)).toEqual({ power: 5, toughness: 5 });
    expect(texts(game, idris)).toContain("{T}: Add {C}.");
    kill(game, idris);
    expect(zone(game, idris)).toBe("graveyard");
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("Idris has the exiled card's triggered abilities", () => {
    const { game, a } = table();
    const altar = spawn(game, "Altar of the Brood");
    pickPermanents(a, altar);
    enter(game, "Idris, Soul of the TARDIS");
    expect(zone(game, altar)).toBe("exile");
    const before = graveyard(game, B).length;
    enter(game, "Grizzly Bears");
    // "Whenever another permanent you control enters, each opponent mills a card."
    expect(graveyard(game, B)).toHaveLength(before + 1);
  });

  it("Idris with no other artifact has nothing, and no bonus", () => {
    const { game } = table();
    const idris = enter(game, "Idris, Soul of the TARDIS");
    expect(pt(game, idris)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("zone: chosen-exiled — the last chosen card", () => {
  it("Koh has nothing until a card is chosen, then that card's abilities, then the next's", () => {
    const { game, a } = table();
    const koh = spawn(game, "Koh, the Face Stealer");
    const fanatic = exiledWith(game, koh, "Mogg Fanatic");
    const elves = exiledWith(game, koh, "Llanowar Elves");
    exiledWith(game, koh, "Strip Mine");
    expect(texts(game, koh)).not.toContain(FANATIC);
    const start = life(game);
    const seen = pickFromZone(a, fanatic);
    activate(game, koh, 0);
    // "A creature card": the land isn't offered.
    expect(seen.offered).toEqual([fanatic, elves]);
    expect(life(game)).toBe(start - 1);
    expect(texts(game, koh)).toContain(FANATIC);
    expect(texts(game, koh)).not.toContain(ELVES_MANA);
    pickFromZone(a, elves);
    activate(game, koh, 0);
    expect(texts(game, koh)).toContain(ELVES_MANA);
    expect(texts(game, koh)).not.toContain(FANATIC);
  });

  it("Koh's trigger from the chosen card fires, and looks back as Koh dies", () => {
    const { game, a } = table();
    const koh = spawn(game, "Koh, the Face Stealer");
    exiledWith(game, koh, "Doomed Traveler");
    activate(game, koh, 0);
    expect(game.state.objects[koh].chosenExiledCard).toBeDefined();
    pickModes(a);
    kill(game, koh);
    expect(zone(game, koh)).toBe("graveyard");
    // "When this creature dies, create a 1/1 white Spirit creature token with flying."
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("the chosen card leaving exile takes its abilities, and doesn't fall back to an earlier one", () => {
    const { game, a } = table();
    const koh = spawn(game, "Koh, the Face Stealer");
    const fanatic = exiledWith(game, koh, "Mogg Fanatic");
    const elves = exiledWith(game, koh, "Llanowar Elves");
    pickFromZone(a, fanatic);
    activate(game, koh, 0);
    pickFromZone(a, elves);
    activate(game, koh, 0);
    expect(texts(game, koh)).toContain(ELVES_MANA);
    game.debugMove(elves, "graveyard");
    expect(texts(game, koh)).not.toContain(ELVES_MANA);
    expect(texts(game, koh)).not.toContain(FANATIC);
  });

  it("Koh exiles another creature on entering, and a dying creature if you choose", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    const koh = enter(game, "Koh, the Face Stealer");
    expect(zone(game, bear)).toBe("exile");
    expect(game.state.objects[bear].exiledWith?.source).toBe(koh);
    const fanatic = spawn(game, "Mogg Fanatic", A);
    pickModes(a, 0);
    pickTargets(a, B);
    activate(game, fanatic, 0, { targets: [ref(B)] });
    expect(zone(game, fanatic)).toBe("exile");
    expect(game.state.objects[fanatic].exiledWith?.source).toBe(koh);
  });
});
