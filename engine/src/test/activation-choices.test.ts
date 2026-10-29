import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  counters,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const offersOf = (game: Game, source: ObjectId, player = A): ActivateOffer[] =>
  game
    .legalActions(player)
    .filter((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source);

const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};

describe("modal activated abilities (rule 700.2b)", () => {
  it("offers each mode as its own activation, with that mode's targets", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bloom = spawn(game, "Cankerbloom");
    spawn(game, "Sol Ring", B);
    const offers = offersOf(game, bloom);
    // No enchantment on the battlefield: that mode can't be chosen (700.2a).
    expect(offers.map((o) => o.modes)).toEqual([[0], [2]]);
    expect(offers[0].text).toBe("{1}, Sacrifice this creature: Destroy target artifact.");
    expect(offers[0].targetSpecs).toEqual(["artifact"]);
  });

  it("resolves the mode chosen as it was activated", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bloom = spawn(game, "Cankerbloom");
    const ring = spawn(game, "Sol Ring", B);
    activate(game, bloom, 0, { modes: [0], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bloom)).toBe("graveyard");
  });

  it("refuses an activation without its modes, or with another mode's targets", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bloom = spawn(game, "Cankerbloom");
    const ring = spawn(game, "Sol Ring", B);
    const base = { type: "activate-ability", player: A, source: bloom, abilityIndex: 0 } as const;
    expect(game.canDispatch({ ...base, targets: [ref(ring)] } as Action)).toMatch(/modes chosen/);
    expect(game.canDispatch({ ...base, modes: [1], targets: [ref(ring)] } as Action)).not.toBeNull();
    expect(game.canDispatch({ ...base, modes: [0, 2], targets: [ref(ring)] } as Action)).not.toBeNull();
  });

  it("reads 'equipped creature' as it resolves (Umezawa's Jitte)", () => {
    const { game } = table();
    const jitte = spawn(game, "Umezawa's Jitte");
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[jitte].attachedTo = bear;
    setCounters(game, jitte, "charge", 2);
    activate(game, jitte, 0, { modes: [0] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    activate(game, jitte, 0, { modes: [2] });
    expect(life(game)).toBe(22);
    expect(counters(game, jitte, "charge")).toBe(0);
  });

  it("offers only the modes this object hasn't had chosen (Three Bowls of Porridge)", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const bowls = spawn(game, "Three Bowls of Porridge");
    const bear = spawn(game, "Grizzly Bears", B);
    expect(offersOf(game, bowls).map((o) => o.modes)).toEqual([[0], [1], [2]]);
    activate(game, bowls, 0, { modes: [1], targets: [ref(bear)] });
    game.state.objects[bowls].tapped = false;
    expect(offersOf(game, bowls).map((o) => o.modes)).toEqual([[0], [2]]);
  });
});

describe("prohibiting the enchanted permanent's abilities", () => {
  it("stops the enchanted creature's activated abilities, for everyone (Arrest)", () => {
    const { game } = table();
    const elf = spawn(game, "Llanowar Elves");
    const other = spawn(game, "Llanowar Elves");
    const arrest = spawn(game, "Arrest", B);
    game.state.objects[arrest].attachedTo = elf;
    expect(offersOf(game, elf)).toHaveLength(0);
    // Its mana ability can't pay for anything either.
    expect(offersOf(game, other)).toHaveLength(1);
  });

  it("stops only the {T} abilities (Serra Bestiary)", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const shaman = spawn(game, "Prodigal Pyromancer");
    const dragon = spawn(game, "Shivan Dragon");
    const bestiary = spawn(game, "Serra Bestiary", B);
    game.state.objects[bestiary].attachedTo = shaman;
    expect(offersOf(game, shaman)).toHaveLength(0);
    // Its "{R}: +1/+0" has no {T}.
    game.state.objects[bestiary].attachedTo = dragon;
    expect(offersOf(game, dragon)).toHaveLength(1);
    expect(offersOf(game, shaman)).toHaveLength(1);
  });

  it("locks a countered ability's source for the turn (Trickbind)", () => {
    const { game, b } = table();
    lands(game, "Island", 2, B);
    lands(game, "Mountain", 2);
    const pyro = spawn(game, "Prodigal Pyromancer");
    const trick = toHand(game, "Trickbind", B);
    activate(game, pyro, 0, { targets: [ref(B)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    b.enqueue({ type: "cast-spell", player: B, card: trick, targets: [{ kind: "object", object: ability }] });
    settle(game);
    expect(life(game, B)).toBe(20);
    game.state.objects[pyro].tapped = false;
    expect(offersOf(game, pyro)).toHaveLength(0);
  });
});

describe("removing chosen counters as a cost", () => {
  it("takes the counter from the creature chosen (Ghave, Guru of Spores)", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const ghave = spawn(game, "Ghave, Guru of Spores");
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, ghave, "+1/+1", 5);
    setCounters(game, bear, "+1/+1", 1);
    let asked: readonly string[] = [];
    a.chooseCounterRemovalsFn = (_view, offer) => {
      asked = offer.eligible.map((e) => e.object);
      return [{ object: bear, kind: "+1/+1", count: 1 }];
    };
    activate(game, ghave, 0);
    expect([...asked].sort()).toEqual([ghave, bear].sort());
    expect(counters(game, bear)).toBe(0);
    expect(counters(game, ghave)).toBe(5);
    expect(tokensNamed(game, "Saproling Token")).toBe(1);
  });

  it("can't be paid without a counter to remove (rule 118.3)", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const ghave = spawn(game, "Ghave, Guru of Spores");
    setCounters(game, ghave, "+1/+1", 0);
    delete game.state.objects[ghave].counters["+1/+1"];
    spawn(game, "Grizzly Bears");
    expect(offersOf(game, ghave).filter((o) => o.abilityIndex === 0)).toHaveLength(0);
  });

  it("asks which kind only when there's more than one (Loch Mare)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const mare = spawn(game, "Loch Mare");
    setCounters(game, mare, "-1/-1", 3);
    const before = hand(game).length;
    let asked = 0;
    a.chooseCounterRemovalsFn = (_view, offer) => {
      asked += 1;
      return [{ object: offer.eligible[0].object, kind: "+1/+1", count: 1 }];
    };
    activate(game, mare, 0);
    expect(asked).toBe(0);
    expect(counters(game, mare, "-1/-1")).toBe(2);
    setCounters(game, mare, "+1/+1", 1);
    activate(game, mare, 0);
    expect(asked).toBe(1);
    expect(counters(game, mare, "+1/+1")).toBe(0);
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("spreads them among creatures (Tayam) and reads X as removed (Ooze Flux)", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const tayam = spawn(game, "Tayam, Luminous Enigma");
    const flux = spawn(game, "Ooze Flux");
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, tayam, "vigilance", 1);
    setCounters(game, bear, "+1/+1", 3);
    a.chooseCounterRemovalsFn = (_view, offer) =>
      offer.max === 3 && offer.eligible.length === 2
        ? [
            { object: tayam, kind: "vigilance", count: 1 },
            { object: bear, kind: "+1/+1", count: 2 },
          ]
        : [{ object: bear, kind: "+1/+1", count: 1 }];
    activate(game, tayam, 0);
    expect(counters(game, tayam, "vigilance")).toBe(0);
    expect(counters(game, bear)).toBe(1);
    // Three milled, then one of them — a Wastes, mana value 0 — returned.
    expect(graveyard(game)).toHaveLength(2);
    activate(game, flux, 0, { x: 1 });
    const ooze = named(game, "Ooze Token (Convert to Slime)")[0];
    expect(pt(game, ooze)).toEqual({ power: 1, toughness: 1 });
    // "One or more": no X of 0.
    expect(offersOf(game, flux)).toHaveLength(0);
  });
});

describe("the remove-counters effect", () => {
  it("removes up to the count from its target, the player choosing how many (Gremlin Mine)", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const mine = spawn(game, "Gremlin Mine");
    const vault = spawn(game, "Everflowing Chalice", B);
    setCounters(game, vault, "charge", 5);
    a.chooseCounterRemovalsFn = (_view, offer) => {
      expect([offer.min, offer.max]).toEqual([0, 4]);
      return [{ object: vault, kind: "charge", count: 3 }];
    };
    activate(game, mine, 1, { targets: [ref(vault)] });
    expect(counters(game, vault, "charge")).toBe(2);
  });

  it("draws only if a counter came off (Mister Hyde)", () => {
    const { game, a } = table();
    const hyde = spawn(game, "Mister Hyde, Monster Within");
    a.chooseModesFn = () => [1];
    nextTurn(game);
    const before = hand(game).length;
    nextTurn(game);
    // Its upkeep found no counter to remove: only the draw step's card.
    expect(hand(game)).toHaveLength(before + 1);
    setCounters(game, hyde, "+1/+1", 1);
    nextTurn(game);
    const then = hand(game).length;
    nextTurn(game);
    expect(counters(game, hyde)).toBe(0);
    expect(hand(game)).toHaveLength(then + 2);
  });
});
