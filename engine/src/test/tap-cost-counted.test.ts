/**
 * Tapping a counted or totalled set as a cost or an effect: "Tap X untapped
 * artifacts you control" (an X announced as it's activated, rule 107.3a, its
 * count on the offer), "that share a creature type" (a total constraint on the
 * picks), and the same as a resolving effect — "you may tap five…; if you do",
 * "tap any number…; when you do" (rule 603.12).
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { defaultTapPicks, shareACreatureType, tapShareChoices } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  cast,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;

const offers = (game: Game, source: ObjectId, index: number): Offer[] =>
  game
    .legalActions(A)
    .filter((a): a is Offer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

function tokens(game: Game, name: string, n: number): ObjectId[] {
  const before = new Set(game.state.zones.shared.battlefield);
  game.debugApplyEffect(A, { kind: "create-token", token: name, count: n });
  return game.state.zones.shared.battlefield.filter((id) => !before.has(id));
}

describe("tap X untapped permanents", () => {
  const PUMP = 1;

  it("Secluded Starforge: offered once per X, each with that many to tap; the effect reads X", () => {
    const { game } = table();
    const forge = spawn(game, "Secluded Starforge");
    lands(game, "Wastes", 2);
    const birds = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    const each = offers(game, forge, PUMP);
    expect(each.map((o) => [o.xCost?.minX, o.xCost?.maxX, o.tapCost?.count])).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
    ]);
    expect(each[2].text).toContain("(X=2)");
    expect(each[2].tapCost?.choices).toEqual(birds);

    game.dispatch({
      type: "activate-ability",
      player: A,
      source: forge,
      abilityIndex: PUMP,
      targets: [ref(birds[2])],
      xValue: 2,
      tap: [birds[0], birds[1]],
    } as Action);
    settle(game);
    expect(tapped(game, birds[0])).toBe(true);
    expect(tapped(game, birds[1])).toBe(true);
    expect(tapped(game, birds[2])).toBe(false);
    expect(pt(game, birds[2]).power).toBe(2);
  });

  it("refuses too few picks for X, and an X past what there is", () => {
    const { game } = table();
    const forge = spawn(game, "Secluded Starforge");
    lands(game, "Wastes", 2);
    const bird = spawn(game, "Ornithopter");
    const base = { type: "activate-ability", player: A, source: forge, abilityIndex: PUMP, targets: [ref(bird)] };
    expect(() => game.dispatch({ ...base, xValue: 1, tap: [] } as Action)).toThrow();
    expect(() => game.dispatch({ ...base, xValue: 2, tap: [bird, bird] } as Action)).toThrow();
    expect(() => game.dispatch({ ...base, xValue: 2 } as Action)).toThrow();
    expect(tapped(game, bird)).toBe(false);
  });

  it("an artifact can't both make the mana and pay the tap (rule 601.2h)", () => {
    const { game } = table();
    const overlord = spawn(game, "Necron Overlord");
    const stones = [spawn(game, "Mind Stone"), spawn(game, "Mind Stone"), spawn(game, "Mind Stone")];
    // X = 1 takes one Stone for {1} and one to tap; X = 2 would take four.
    const each = offers(game, overlord, 0);
    expect(each.map((o) => o.xCost?.maxX)).toEqual([0, 1]);
    // With lands for the mana, all three can tap.
    lands(game, "Wastes", 3);
    expect(offers(game, overlord, 0).map((o) => o.xCost?.maxX)).toEqual([0, 1, 2, 3]);
    activate(game, overlord, 0, { x: 3, targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    for (const stone of stones) expect(tapped(game, stone)).toBe(true);
    expect(tapped(game, overlord)).toBe(true);
  });

  it("Aryel: never itself, and the target is chosen by X", () => {
    const { game } = table();
    const aryel = spawn(game, "Aryel, Knight of Windgrace");
    lands(game, "Swamp", 1);
    const knights = tokens(game, "Knight Token", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Llanowar Elves", B);
    const each = offers(game, aryel, 1);
    expect(each.map((o) => o.xCost?.maxX)).toEqual([1, 2]);
    expect(each[1].tapCost?.choices).not.toContain(aryel);
    const atTwo = each[1].targetOptions[0].map((t) => (t.kind === "object" ? t.object : null));
    expect(atTwo).toContain(bears);
    expect(atTwo).not.toContain(giant);
    activate(game, aryel, 1, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    for (const knight of knights) expect(tapped(game, knight)).toBe(true);
  });

  it("a token stack gives as many as it has tokens", () => {
    const { game } = table();
    const forge = spawn(game, "Secluded Starforge");
    lands(game, "Wastes", 2);
    const [stack] = tokens(game, "Thopter Token", 10);
    expect(game.state.objects[stack].stackCount ?? 1).toBeGreaterThan(1);
    const top = offers(game, forge, PUMP).at(-1);
    expect(top?.xCost?.maxX).toBe(10);
    expect(top?.tapCost?.copies?.[stack]).toBe(10);
  });
});

describe("tap creatures that share a creature type", () => {
  const onto = (game: Game, victim: ObjectId): ObjectId => {
    lands(game, "Plains", 2);
    const aura = toHand(game, "Weight of Conscience");
    cast(game, aura, { targets: [ref(victim)] });
    return aura;
  };

  it("isn't offered without two that share one", () => {
    const { game } = table();
    const victim = spawn(game, "Hill Giant", B);
    const aura = onto(game, victim);
    spawn(game, "Goblin Piker");
    spawn(game, "Llanowar Elves");
    expect(offers(game, aura, 0)).toEqual([]);
  });

  it("offers those with a partner, refuses a pair with nothing in common, exiles with a pair that shares", () => {
    const { game } = table();
    const victim = spawn(game, "Hill Giant", B);
    const aura = onto(game, victim);
    const goblins = [spawn(game, "Goblin Piker"), spawn(game, "Goblin Piker")];
    const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Elvish Mystic")];
    const loner = spawn(game, "Grizzly Bears");
    const offer = offers(game, aura, 0)[0];
    expect(offer.tapCost?.count).toBe(2);
    expect(offer.tapCost?.choices).toEqual([...goblins, ...elves]);
    expect(offer.tapCost?.choices).not.toContain(loner);

    const base = { type: "activate-ability", player: A, source: aura, abilityIndex: 0, targets: [] };
    expect(() => game.dispatch({ ...base, tap: [goblins[0], elves[0]] } as Action)).toThrow(/share a creature type/);
    game.dispatch({ ...base, tap: elves } as Action);
    settle(game);
    expect(tapped(game, elves[0])).toBe(true);
    expect(tapped(game, elves[1])).toBe(true);
    expect(tapped(game, goblins[0])).toBe(false);
    expect(zone(game, victim)).toBe("exile");
  });

  it("a changeling shares a type with anything that has one, and a driver that doesn't choose gets a pair that shares", () => {
    const { game } = table();
    const victim = spawn(game, "Hill Giant", B);
    const aura = onto(game, victim);
    const changeling = spawn(game, "Changeling Outcast");
    const goblin = spawn(game, "Goblin Piker");
    const elf = spawn(game, "Llanowar Elves");
    const offer = offers(game, aura, 0)[0];
    expect(offer.tapCost?.choices).toEqual([changeling, goblin, elf]);
    const types = offer.tapCost?.creatureTypes ?? {};
    expect(shareACreatureType([types[changeling], types[elf]])).toBe(true);
    expect(shareACreatureType([types[goblin], types[elf]])).toBe(false);
    if (offer.tapCost !== undefined) {
      const picks = defaultTapPicks(offer.tapCost, () => false);
      expect(picks.length).toBe(2);
      expect(picks).toContain(changeling);
      // Whichever group a random pick lands on holds two.
      for (let i = 0; i < 2; i += 1) expect(tapShareChoices(offer.tapCost, () => i).length).toBe(2);
    }
    activate(game, aura, 0);
    expect(zone(game, victim)).toBe("exile");
  });

  it("two tokens of one stack share their types", () => {
    const { game } = table();
    const victim = spawn(game, "Hill Giant", B);
    const aura = onto(game, victim);
    const [stack] = tokens(game, "Thopter Token", 10);
    game.dispatch({ type: "activate-ability", player: A, source: aura, abilityIndex: 0, targets: [], tap: [stack, stack] } as Action);
    settle(game);
    expect(zone(game, victim)).toBe("exile");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(10);
  });
});

/** Thousand Moons Smithy on its back face. */
function barracksOn(game: Game, tappedNow = false): ObjectId {
  const id = spawn(game, "Thousand Moons Smithy", A, { tapped: tappedNow });
  game.state.objects[id].face = 1;
  return id;
}

describe("tapping a set as an effect", () => {
  it("Thousand Moons Smithy: makes its Gnome Soldier; five taps transform it, all or nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const smithy = toHand(game, "Thousand Moons Smithy");
    cast(game, smithy);
    const [gnome] = named(game, "Gnome Soldier Token", A);
    // The Smithy and the Soldier itself: two artifacts and/or creatures.
    expect(pt(game, gnome)).toEqual({ power: 2, toughness: 2 });
    const birds = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    pickModes(a, 0);
    const chose = pickPermanents(a, smithy, gnome, ...birds);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(chose.offered).toEqual(expect.arrayContaining([smithy, gnome, ...birds]));
    expect(game.state.objects[smithy].face).toBe(1);
    for (const id of [gnome, ...birds]) expect(tapped(game, id)).toBe(true);
    expect(game.state.objects[smithy].tapped).toBe(true);
  });

  it("Thousand Moons Smithy: isn't asked with four to tap", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const smithy = toHand(game, "Thousand Moons Smithy");
    cast(game, smithy);
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(asked).toBe(0);
    expect(game.state.objects[smithy].face ?? 0).toBe(0);
  });

  it("Barracks of the Thousand: a token only for an artifact or creature spell using its own mana", () => {
    // Another source's mana on a creature spell: no token.
    const first = table().game;
    barracksOn(first, true);
    lands(first, "Plains", 1);
    cast(first, toHand(first, "Savannah Lions"));
    expect(tokensNamed(first, "Gnome Soldier Token", A)).toBe(0);
    // Its own mana on an artifact: a token.
    const second = table().game;
    barracksOn(second);
    cast(second, toHand(second, "Sol Ring"));
    expect(tokensNamed(second, "Gnome Soldier Token", A)).toBe(1);
    // Its own mana floated by hand, then spent on a creature: a token.
    const floated = table().game;
    const barracks = barracksOn(floated);
    activate(floated, barracks, 0, { settle: false });
    cast(floated, toHand(floated, "Savannah Lions"));
    expect(tokensNamed(floated, "Gnome Soldier Token", A)).toBe(1);
    // Its own mana on neither: none.
    const third = table().game;
    barracksOn(third);
    const victim = spawn(third, "Grizzly Bears", B);
    cast(third, toHand(third, "Swords to Plowshares"), { targets: [ref(victim)] });
    expect(tokensNamed(third, "Gnome Soldier Token", A)).toBe(0);
  });

  it("tap any number, when you do: the reflexive ability's filter reads how many (Teferi Akosa's −3)", () => {
    const { game, a } = table();
    const elf = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const cheap = spawn(game, "Sol Ring", B);
    const dear = spawn(game, "Grizzled Outrider", B);
    const seen = pickPermanents(a, elf, bears);
    const stone = spawn(game, "Mind Stone", B);
    let offered: readonly TargetRef[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, options) => {
      offered = options[0];
      return [ref(cheap)];
    };
    const untapped = { type: "creature", tapped: false, controlledBy: "you" } as const;
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        {
          kind: "choose-permanents",
          filter: untapped,
          min: 0,
          upTo: { countOf: untapped },
          then: { kind: "tap", target: 0 },
          prompt: "Tap any number of untapped creatures you control",
        },
        {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "permanent",
              filter: {
                notTypes: ["land"],
                controlledBy: "opponent",
                manaValue: { op: "lte", n: { amount: { triggerValue: true } } },
              },
            },
          ],
          value: { thisWay: "tapped" },
          effect: { kind: "shuffle-into-library", target: 0 },
          text: "When you do, shuffle target nonland permanent an opponent controls with mana value X or less into its owner's library, where X is the number of creatures tapped this way.",
        },
      ],
    }, [], { source: elf });
    settle(game);
    expect(seen.offered.length).toBe(3);
    expect(tapped(game, elf)).toBe(true);
    expect(tapped(game, bears)).toBe(true);
    // Two tapped: mana value 2 or less. Grizzled Outrider's is 5.
    expect(offered).toEqual(expect.arrayContaining([ref(cheap), ref(stone)]));
    expect(offered).not.toContainEqual(ref(dear));
    expect(zone(game, cheap)).toBe("library");
    expect(zone(game, dear)).toBe("battlefield");
  });
});
