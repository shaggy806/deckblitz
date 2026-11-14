/**
 * Attractions (rule 717): the Attraction deck in the command zone, opening
 * an Attraction (701.51), rolling to visit (701.52, the precombat main
 * phase's turn-based action 717.4 / 703.4g, and the effect), visit abilities
 * (702.159a), claiming the prize (702.159b), the junkyard (717.6), lit
 * numbers (717.1), the reads of what was visited this turn, the view, and
 * the Attraction deck's construction rules (717.2a). The die comes from the
 * seeded stream: a test lights an Attraction up on every number (`lightUp`)
 * to be sure it's visited, or on none to be sure it isn't, and reads the roll
 * from the `rolled-to-visit` event.
 */
import { describe, expect, it } from "vitest";

import { attractionDeckProblems, validateCommanderDeck } from "../deck-validation.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  lightUp,
  named,
  pickModes,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const TEN = [
  "Information Booth",
  "Clown Extruder",
  "Concession Stand",
  "Fortune Teller",
  "Kiddie Coaster",
  "Roller Coaster",
  "Trash Bin",
  "Spinny Ride",
  "Bumper Cars",
  "Merry-Go-Round",
] as const;

const ALL = [1, 2, 3, 4, 5, 6] as const;

const events = (game: Game, type: string) => game.state.eventLog.filter((e) => e.type === type);
const deckOf = (game: Game, player = A): readonly ObjectId[] => game.state.players[player].attractionDeck ?? [];
const junkyardOf = (game: Game, player = A): readonly ObjectId[] => game.state.players[player].junkyard ?? [];
const visitedThisTurn = (game: Game): number =>
  game.state.journal?.entries.filter((e) => e.kind === "visited" && e.turn === game.state.turn.number).length ?? 0;

describe("the Attraction deck (rule 717.2)", () => {
  it("begins face down in the command zone, apart from the library and the command zone's list", () => {
    const { game } = table({ attractions: [...TEN] });
    const deck = deckOf(game);
    expect(deck).toHaveLength(10);
    expect(deck.map((id) => game.state.objects[id].cardName)).toEqual([...TEN]);
    for (const id of deck) {
      expect(zone(game, id)).toBe("command");
      expect(game.state.zones.shared.command).not.toContain(id);
    }
    // Seven in the opening hand, one drawn on turn 1 (the table draws then).
    expect(game.state.zones.perPlayer[A].library).toHaveLength(40 - 8);
    expect(deckOf(game, B)).toHaveLength(0);
  });

  it("a deck entry picks the printing, and so the numbers lit up on it (rule 717.1)", () => {
    const { game } = table({ attractions: [{ name: "Balloon Stand", collector: "200c" }, "Bumper Cars"] });
    const [balloon, cars] = deckOf(game);
    expect(game.state.objects[balloon].lights).toEqual([4, 6]);
    // No printing named: the first.
    expect(game.state.objects[cars].lights).toEqual([2, 3, 6]);
  });

  it("only Attraction cards may be in it", () => {
    expect(() => table({ attractions: ["Grizzly Bears"] })).toThrow(/not an Attraction/);
  });

  it("its size is public and its cards hidden from every seat, its owner's too", () => {
    const { game } = table({ attractions: [...TEN] });
    for (const viewer of [A, B]) {
      const view = viewFor(game.state, registryOf(game), viewer);
      expect(view.players[A].attractionDeckSize).toBe(10);
      expect(view.players[B].attractionDeckSize).toBe(0);
      for (const id of deckOf(game)) expect(view.objects[id]).toBeUndefined();
    }
  });

  it("is shuffled before the game (rule 103.3a) when the game shuffles", async () => {
    const { Game } = await import("../game.js");
    const orders = new Set<string>();
    for (const seed of [1, 2, 3, 4]) {
      const game = Game.create({
        seed,
        registry: registryOf(table().game),
        decks: [
          { player: A, cards: Array<string>(40).fill("Wastes"), attractions: [...TEN] },
          { player: B, cards: Array<string>(40).fill("Wastes") },
        ],
      });
      orders.add(deckOf(game).map((id) => game.state.objects[id].cardName).join("|"));
    }
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("opening an Attraction (rule 701.51)", () => {
  it("puts the top card of the Attraction deck onto the battlefield under its owner's control", () => {
    const { game } = table({ attractions: [...TEN] });
    const top = deckOf(game)[0];
    enter(game, "Rad Rascal");
    expect(zone(game, top)).toBe("battlefield");
    expect(game.state.objects[top].controller).toBe(A);
    expect(deckOf(game)).toHaveLength(9);
    expect(deckOf(game)).not.toContain(top);
    const opened = events(game, "attraction-opened");
    expect(opened).toHaveLength(1);
    expect(opened[0]).toMatchObject({ player: A, object: top });
  });

  it("with no Attraction deck, or an empty one, opens nothing (rule 701.51a)", () => {
    const { game } = table();
    const gamer = enter(game, "The Most Dangerous Gamer");
    expect(events(game, "attraction-opened")).toHaveLength(0);
    // "Whenever you open an Attraction" didn't trigger.
    expect(counters(game, gamer)).toBe(0);
  });

  it("open two: one at a time, top first", () => {
    const { game } = table({ attractions: [...TEN] });
    const [first, second] = deckOf(game);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Step Right Up"));
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    expect(deckOf(game)).toHaveLength(8);
  });

  it("\"whenever you open an Attraction\" triggers once per Attraction opened (rule 701.51c)", () => {
    const { game } = table({ attractions: [...TEN] });
    const gamer = enter(game, "The Most Dangerous Gamer");
    // Its own enters trigger opened one; that open triggered its counter.
    expect(counters(game, gamer)).toBe(1);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Step Right Up"));
    expect(counters(game, gamer)).toBe(3);
  });

  it("an opened Attraction shows its lit numbers in every seat's view", () => {
    const { game } = table({ attractions: [{ name: "Balloon Stand", collector: "200b" }] });
    const [balloon] = deckOf(game);
    enter(game, "Rad Rascal");
    expect(viewFor(game.state, registryOf(game), B).objects[balloon]?.lights).toEqual([3, 6]);
  });
});

describe("the junkyard (rule 717.6)", () => {
  it("a destroyed Attraction goes to its owner's junkyard, not the graveyard", () => {
    const { game } = table();
    const booth = spawn(game, "Information Booth");
    destroy(game, booth);
    expect(zone(game, booth)).toBe("command");
    expect(junkyardOf(game)).toEqual([booth]);
    expect(graveyard(game)).not.toContain(booth);
    expect(game.state.zones.shared.command).not.toContain(booth);
    // Face up and public (717.6a).
    const view = viewFor(game.state, registryOf(game), B);
    expect(view.players[A].junkyard).toEqual([booth]);
    expect(view.objects[booth]?.cardName).toBe("Information Booth");
  });

  it("so does one returned to its owner's hand, or put into a hand or library from anywhere", () => {
    const { game } = table();
    const booth = spawn(game, "Information Booth");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Boomerang"), { targets: [ref(booth)] });
    expect(zone(game, booth)).toBe("command");
    expect(hand(game)).not.toContain(booth);
    // Even one a hand or a library would get from outside the battlefield.
    const teller = toHand(game, "Fortune Teller");
    expect(zone(game, teller)).toBe("command");
    expect(junkyardOf(game)).toEqual([booth, teller]);
  });

  it("Draconian Gate-Bot destroys target Attraction into its junkyard", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Clown Extruder", B);
    pickModes(a, 1);
    pickTargets(a, theirs);
    enter(game, "Draconian Gate-Bot");
    expect(junkyardOf(game, B)).toEqual([theirs]);
    expect(graveyard(game, B)).not.toContain(theirs);
  });

  it("a copy of an Attraction goes to the graveyard (Draconian Gate-Bot's ruling)", () => {
    const { game } = table();
    spawn(game, "Information Booth");
    lands(game, "Wastes", 3);
    const copy = toHand(game, "Sculpting Steel");
    cast(game, copy);
    expect(zone(game, copy)).toBe("battlefield");
    expect(game.state.objects[copy].copyOf).toBe("Information Booth");
    destroy(game, copy);
    expect(zone(game, copy)).toBe("graveyard");
    expect(junkyardOf(game)).toEqual([]);
  });

  it("an Attraction exiled stays in exile (the replacement leaves exile alone)", () => {
    const { game, a } = table();
    const booth = spawn(game, "Information Booth", B);
    pickTargets(a, booth);
    enter(game, "Oblivion Ring");
    expect(zone(game, booth)).toBe("exile");
    expect(junkyardOf(game, B)).toEqual([]);
  });
});

describe("rolling to visit (rule 701.52)", () => {
  it("as the active player's precombat main phase begins, if they control an Attraction (rule 717.4)", () => {
    const { game } = table();
    const booth = spawn(game, "Information Booth");
    lightUp(game, booth, ALL);
    const before = hand(game).length;
    toStep(game, "precombat-main");
    const rolled = events(game, "rolled-to-visit");
    expect(rolled).toHaveLength(1);
    expect(rolled[0]).toMatchObject({ player: A });
    // The roll was a six-sided die roll (rule 706), made first.
    const dice = events(game, "dice-rolled").at(-1);
    expect(dice).toMatchObject({ player: A, sides: 6 });
    expect(events(game, "attraction-visited")).toHaveLength(1);
    settle(game);
    // Its draw step's card, and the Booth's.
    expect(hand(game).length).toBe(before + 2);
  });

  it("doesn't roll for a player who controls no Attraction", () => {
    const { game } = table();
    toStep(game, "precombat-main");
    expect(events(game, "rolled-to-visit")).toHaveLength(0);
    expect(events(game, "dice-rolled")).toHaveLength(0);
  });

  it("visits only Attractions with the result lit up", () => {
    const { game } = table();
    const lit = spawn(game, "Information Booth");
    const dark = spawn(game, "Fortune Teller");
    lightUp(game, lit, ALL);
    lightUp(game, dark, []);
    toStep(game, "precombat-main");
    const visited = events(game, "attraction-visited");
    expect(visited).toHaveLength(1);
    expect(visited[0]).toMatchObject({ object: lit });
  });

  it("visits the result's Attractions exactly: lit up on the number rolled", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      const ids = [1, 2, 3, 4, 5, 6].map((n) => {
        const id = spawn(game, "Information Booth");
        lightUp(game, id, [n]);
        return id;
      });
      toStep(game, "precombat-main");
      const result = events(game, "rolled-to-visit")[0];
      if (result?.type !== "rolled-to-visit") throw new Error("no roll");
      expect(events(game, "attraction-visited").map((e) => (e.type === "attraction-visited" ? e.object : null))).toEqual([
        ids[result.result - 1],
      ]);
    }
  });

  it("an opponent's Attraction isn't visited by your roll", () => {
    const { game } = table();
    const mine = spawn(game, "Information Booth");
    const theirs = spawn(game, "Fortune Teller", B);
    lightUp(game, mine, ALL);
    lightUp(game, theirs, ALL);
    toStep(game, "precombat-main");
    // Bob rolled for his own on his turn; on alice's, only hers.
    const hers = events(game, "attraction-visited").filter((e) => e.type === "attraction-visited" && e.player === A);
    expect(hers.map((e) => (e.type === "attraction-visited" ? e.object : null))).toEqual([mine]);
  });

  it("the effect: Line Cutter rolls to visit as its ability resolves", () => {
    const { game } = table();
    const booth = spawn(game, "Information Booth");
    lightUp(game, booth, ALL);
    const before = hand(game).length;
    enter(game, "Line Cutter");
    expect(events(game, "rolled-to-visit")).toHaveLength(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("is a die roll: \"whenever you roll one or more dice\" sees it", () => {
    const { game } = table();
    const box = spawn(game, "Vexing Puzzlebox");
    spawn(game, "Information Booth");
    enter(game, "Line Cutter");
    const rolled = events(game, "rolled-to-visit")[0];
    if (rolled?.type !== "rolled-to-visit") throw new Error("no roll");
    expect(counters(game, box, "charge")).toBe(rolled.result);
  });
});

describe("claiming the prize (rule 702.159b)", () => {
  it("Pick-a-Beeble: luck counters, a Treasure, and at six the prize — two Treasures, sacrifice it, open an Attraction", () => {
    const { game, a } = table({ attractions: ["Information Booth"] });
    const gamer = spawn(game, "The Most Dangerous Gamer");
    const victim = spawn(game, "Grizzly Bears", B);
    const beeble = spawn(game, "Pick-a-Beeble");
    game.state.objects[beeble].counters.luck = 5;
    lightUp(game, beeble, ALL);
    pickTargets(a, victim);
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    // Sacrificed: into its owner's junkyard (rule 717.6).
    expect(junkyardOf(game)).toEqual([beeble]);
    expect(events(game, "prize-claimed")).toHaveLength(1);
    // The opened Booth, and the Gamer's two triggers.
    expect(named(game, "Information Booth", A)).toHaveLength(1);
    expect(counters(game, gamer)).toBe(1);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("short of six luck counters, no prize", () => {
    const { game } = table();
    const beeble = spawn(game, "Pick-a-Beeble");
    lightUp(game, beeble, ALL);
    toStep(game, "precombat-main");
    settle(game);
    const luck = counters(game, beeble, "luck");
    expect(luck).toBeGreaterThanOrEqual(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(luck >= 6 ? 3 : 1);
    if (luck < 6) expect(events(game, "prize-claimed")).toHaveLength(0);
  });
});

describe("what was visited this turn", () => {
  it("each Attraction counts once however often it was visited", () => {
    const { game } = table();
    const booth = spawn(game, "Information Booth");
    const ride = spawn(game, "Storybook Ride");
    lightUp(game, booth, ALL);
    lightUp(game, ride, []);
    toStep(game, "precombat-main");
    settle(game);
    enter(game, "Line Cutter");
    expect(visitedThisTurn(game)).toBe(2);
    // Storybook Ride, visited now: X counts the Booth and itself.
    lightUp(game, ride, ALL);
    const library = game.state.zones.perPlayer[A].library.length;
    enter(game, "Line Cutter");
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 2 - 1);
  });

  it("Soul Swindler is indestructible once you've visited an Attraction this turn", () => {
    const { game } = table();
    const swindler = spawn(game, "Soul Swindler");
    destroy(game, swindler);
    expect(zone(game, swindler)).toBe("graveyard");
    const again = spawn(game, "Soul Swindler");
    lightUp(game, spawn(game, "Information Booth"), ALL);
    enter(game, "Line Cutter");
    destroy(game, again);
    expect(zone(game, again)).toBe("battlefield");
  });

  it("an Attraction you've visited needn't still be on the battlefield (Black Hole's ruling)", () => {
    const { game, a } = table();
    const booth = spawn(game, "Information Booth");
    lightUp(game, booth, ALL);
    enter(game, "Line Cutter");
    destroy(game, booth);
    const [x, y, z] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    pickTargets(a, x, y);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Black Hole"), { targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
    expect(zone(game, z)).toBe("battlefield");
  });
});

describe("the Attraction deck's construction (rule 717.2a)", () => {
  it("ten or more, each a different name, only Attractions", () => {
    const registry = registryOf(table().game);
    expect(attractionDeckProblems([...TEN], registry)).toEqual([]);
    expect(attractionDeckProblems([], registry)).toEqual([]);
    expect(attractionDeckProblems(TEN.slice(0, 9), registry).join()).toMatch(/at least 10/);
    expect(attractionDeckProblems([...TEN.slice(0, 9), "Information Booth"], registry).join()).toMatch(/different name/);
    expect(attractionDeckProblems([...TEN, "Grizzly Bears"], registry).join()).toMatch(/isn't an Attraction/);
    // Limited (717.2b): three, repeats allowed.
    expect(attractionDeckProblems(["Trash Bin", "Trash Bin", "Trash Bin"], registry, { limited: true })).toEqual([]);
  });

  it("an Attraction can't be in the deck itself", () => {
    const registry = registryOf(table().game);
    const result = validateCommanderDeck({ commanders: ["Atraxa, Praetors' Voice"], cards: ["Trash Bin"], size: 2 }, registry);
    expect(result.violations.join()).toMatch(/Attraction deck/);
  });
});
