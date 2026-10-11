/**
 * The set walk, batch 53, part c (2026-10-11): Reality Fracture's last cards, Reality Fracture
 * Commander's and The Hobbit's. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const jaceToken = (game: Game, player = A): ObjectId => {
  const [jace] = named(game, "Jace Token", player);
  if (jace === undefined) throw new Error("no Jace token");
  return jace;
};

describe("Way of the Deathbringer", () => {
  it("empowers Jace 5, and the granted −2 sacrifices a creature for a 4/4 trampling Beast", () => {
    const { game, a } = table();
    enter(game, "Way of the Deathbringer");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(5);
    toStep(game, "postcombat-main");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    // The Jace token's two printed abilities come first; the granted one is third.
    activate(game, jace, 2);
    expect(counters(game, jace, "loyalty")).toBe(3);
    expect(zone(game, bears)).toBe("graveyard");
    const [beast] = named(game, "Beast Token (Garruk, Veiled Butcher)");
    expect(beast).toBeDefined();
    expect(pt(game, beast)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, beast).has("trample")).toBe(true);
  });

  it("declining the sacrifice makes no Beast", () => {
    const { game, a } = table();
    spawn(game, "Way of the Deathbringer");
    const beleren = spawn(game, "Jace Beleren");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    activate(game, beleren, game.registry.get("Jace Beleren").activated.length);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Beast Token (Garruk, Veiled Butcher)")).toBe(0);
  });
});

describe("Way of the Warlord", () => {
  it("the granted −4 deals 2 to up to one creature or planeswalker and 2 to target player", () => {
    const { game } = table();
    enter(game, "Way of the Warlord");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(5);
    toStep(game, "postcombat-main");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, jace, 2, { targets: [ref(bears), ref(B)] });
    expect(counters(game, jace, "loyalty")).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("with no creature or planeswalker chosen, the player still takes 2", () => {
    const { game } = table();
    spawn(game, "Way of the Warlord");
    const beleren = spawn(game, "Jace Beleren");
    game.state.objects[beleren].counters.loyalty = 5;
    activate(game, beleren, game.registry.get("Jace Beleren").activated.length, { targets: [null, ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(counters(game, beleren, "loyalty")).toBe(1);
  });
});

describe("Memnarch, the Warden", () => {
  it("makes two Myr, and draws a card for each artifact you control as it attacks", () => {
    const { game, a } = table();
    const memnarch = enter(game, "Memnarch, the Warden");
    expect(tokensNamed(game, "Myr Token", A)).toBe(2);
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    const before = hand(game).length;
    attack(game, a, [memnarch]);
    // Memnarch, two Myr and a Sol Ring: four artifacts of alice's.
    expect(hand(game).length).toBe(before + 4);
  });
});

describe("The Arkenstone // Seek the Heart", () => {
  it("Seek the Heart finds a legendary creature; the Arkenstone, cast from exile, pumps and draws", () => {
    const { game, a } = table();
    lands(game, "Plains", 8);
    toLibrary(game, "Grizzly Bears");
    const legend = toLibrary(game, "Bilbo Baggins, Burglar");
    const card = toHand(game, "The Arkenstone");
    const seen = pickFromZone(a, legend);
    cast(game, card, { face: 1 });
    expect(seen.offered).toEqual([legend]);
    expect(zone(game, legend)).toBe("hand");
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Glóin the Mighty // Easy Pickings", () => {
  it("Easy Pickings deals 1 to each creature your opponents control; Glóin adds {R}{R} in your first main phase", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const theirs = spawn(game, "Llanowar Elves", B);
    const mine = spawn(game, "Llanowar Elves");
    const card = toHand(game, "Glóin the Mighty");
    cast(game, card, { face: 1 });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    toStep(game, "upkeep", B);
    toStep(game, "precombat-main");
    // Run the trigger, but keep the priority in this main phase.
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.priority.holder === A);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R", "R"]);
  });
});

describe("Gandalf, Goblins' Bane // Flameshape", () => {
  it("Flameshape's cards can be played only while you control a Wizard", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const second = toLibrary(game, "Shock");
    const first = toLibrary(game, "Island");
    const card = toHand(game, "Gandalf, Goblins' Bane");
    cast(game, card, { face: 1 });
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(game.state.objects[first].exiledFaceDown?.lookers).toEqual([A]);
    const playable = (): boolean =>
      game.legalActions(A).some((o) => o.kind === "play-land" && o.card === first);
    expect(playable()).toBe(false);
    const wizard = spawn(game, "Prodigal Sorcerer");
    expect(playable()).toBe(true);
    destroy(game, wizard);
    toStep(game, "postcombat-main");
    expect(playable()).toBe(false);
  });

  it("Gandalf gets +1/+1 and pings each opponent whenever you cast a noncreature spell", () => {
    const { game } = table({ players: 3 });
    const gandalf = spawn(game, "Gandalf, Goblins' Bane");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, gandalf)).toEqual({ power: 3, toughness: 4 });
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Hobbit Hole", () => {
  it("Halflingcycling {4} finds only a Halfling card", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    toLibrary(game, "Grizzly Bears");
    const bilbo = toLibrary(game, "Bilbo Baggins, Burglar");
    const hole = toHand(game, "Hobbit Hole");
    const seen = pickFromZone(a, bilbo);
    game.dispatch({ type: "cycle", player: A, card: hole });
    settle(game);
    expect(zone(game, hole)).toBe("graveyard");
    expect(seen.offered).toEqual([bilbo]);
    expect(zone(game, bilbo)).toBe("hand");
  });
});

describe("The Lonely Mountain", () => {
  it("enters tapped unless you control an Equipment", () => {
    const { game } = table();
    const tapped = toHand(game, "The Lonely Mountain");
    game.dispatch({ type: "play-land", player: A, card: tapped });
    settle(game);
    expect(game.state.objects[tapped].tapped).toBe(true);
    spawn(game, "Bonesplitter");
    const untapped = toHand(game, "The Lonely Mountain");
    game.dispatch({ type: "play-land", player: A, card: untapped });
    settle(game);
    expect(game.state.objects[untapped].tapped).toBe(false);
  });

  it("makes a 2/2 Dwarf for {1} less per Equipment you control", () => {
    const { game } = table();
    spawn(game, "Bonesplitter");
    spawn(game, "Bonesplitter");
    // Untapped: it enters with an Equipment already there.
    const mountain = spawn(game, "The Lonely Mountain");
    lands(game, "Mountain", 3);
    // {4}{R} less {2}: three Mountains pay it.
    activate(game, mountain, 1);
    const [dwarf] = named(game, "2/2 Red Dwarf Token");
    expect(dwarf).toBeDefined();
    expect(pt(game, dwarf)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, dwarf)).toContain("Dwarf");
  });
});

describe("The Great Goblin and Bothersome Noisemaker", () => {
  it("amassing Goblins onto an Army is putting counters on it: 2 damage to target opponent", () => {
    const { game, a } = table();
    spawn(game, "The Great Goblin");
    spawn(game, "Bothersome Noisemaker");
    lands(game, "Island", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Opt"));
    const [army] = named(game, "Army Token");
    expect(army).toBeDefined();
    expect(counters(game, army)).toBe(1);
    expect(subtypes(game, army)).toEqual(expect.arrayContaining(["Goblin", "Army"]));
    expect(life(game, B)).toBe(18);
  });

  it("counters an opponent puts on your Goblin don't trigger it", () => {
    const { game } = table();
    spawn(game, "The Great Goblin");
    const goblin = spawn(game, "Bothersome Noisemaker");
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(goblin)]);
    settle(game);
    expect(counters(game, goblin)).toBe(1);
    expect(life(game, B)).toBe(20);
  });

  it("another Goblin you control dying exiles your top card to play until the end of your next turn", () => {
    const { game } = table();
    spawn(game, "The Great Goblin");
    const goblin = spawn(game, "Bothersome Noisemaker");
    const top = toLibrary(game, "Island");
    destroy(game, goblin);
    expect(zone(game, top)).toBe("exile");
    // Settling the trigger ran on into combat; a land is played in a main phase.
    toStep(game, "postcombat-main");
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && o.card === top)).toBe(true);
  });
});

describe("The Notary Hobbits", () => {
  it("makes two nonlegendary token copies, and taps for {C} per Halfling", () => {
    const { game } = table();
    const hobbits = enter(game, "The Notary Hobbits");
    const all = named(game, "The Notary Hobbits");
    expect(all).toHaveLength(3);
    const tokens = all.filter((id) => game.state.objects[id].isToken);
    expect(tokens).toHaveLength(2);
    for (const token of tokens) expect(supertypes(game, token)).not.toContain("legendary");
    expect(supertypes(game, hobbits)).toContain("legendary");
    activate(game, hobbits, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C", "C", "C"]);
  });
});
