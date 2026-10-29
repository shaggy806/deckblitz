/**
 * Group B of the choices / graveyards / repeat batch: targets tied to one controller or one
 * graveyard (Bioshift, Spurnmage Advocate, Waste Management, Soul-Shackled Zombie), and groups
 * bounded by an amount read as the targets are chosen (Cephalid Constable, Mogis's Marauder, Vile
 * Requiem).
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** The `max` of the first target spec the seat is asked about. */
function groupMax(specs: readonly unknown[]): unknown {
  const spec = specs[0];
  return typeof spec === "object" && spec !== null && "max" in spec ? (spec as { max: unknown }).max : undefined;
}

describe("Bioshift", () => {
  it("moves the chosen number of counters between two creatures of one controller, and refuses two controllers", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Forest", 1);
    const from = spawn(game, "Grizzly Bears", B);
    const to = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    game.state.objects[from].counters["+1/+1"] = 3;
    const spell = toHand(game, "Bioshift");
    expect(() => cast(game, spell, { targets: [ref(from), ref(carols)] })).toThrow(/refused/);
    a.chooseModesFn = (_view, _min, _max, texts) => {
      const i = texts.findIndex((t) => t.includes("2 +1/+1"));
      return i < 0 ? [] : [i];
    };
    cast(game, spell, { targets: [ref(from), ref(to)] });
    expect(counters(game, from)).toBe(1);
    expect(counters(game, to)).toBe(2);
  });
});

describe("Cephalid Constable", () => {
  it("returns up to as many of that player's permanents as the combat damage it dealt", () => {
    const { game, a } = table();
    const constable = spawn(game, "Cephalid Constable");
    game.state.objects[constable].counters["+1/+1"] = 1;
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const forest = spawn(game, "Forest", B);
    let max: unknown;
    let offeredMine = true;
    a.chooseTargetsFn = (_view, _name, specs, options) => {
      max = groupMax(specs);
      offeredMine = options.flat().some((t) => t.kind === "object" && t.object === constable);
      return [ref(bears), ref(forest)];
    };
    attack(game, a, [constable]);
    expect(max).toBe(2);
    expect(offeredMine).toBe(false);
    expect([zone(game, bears), zone(game, forest), zone(game, giant)]).toEqual(["hand", "hand", "battlefield"]);
  });
});

describe("Mogis's Marauder", () => {
  it("targets up to your devotion to black, each gaining intimidate and haste", () => {
    const { game, a } = table();
    spawn(game, "Vile Requiem");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      max = groupMax(specs);
      return [ref(bears)];
    };
    enter(game, "Mogis's Marauder");
    expect(max).toBe(3);
    expect(keywords(game, bears).has("intimidate")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Vile Requiem", () => {
  it("destroys up to as many nonblack creatures as its verse counters, counted before it's sacrificed", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const requiem = spawn(game, "Vile Requiem");
    game.state.objects[requiem].counters.verse = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const lions = spawn(game, "Savannah Lions", B);
    expect(() => activate(game, requiem, 0, { targets: [ref(bears), ref(giant), ref(lions)] })).toThrow(/refused/);
    activate(game, requiem, 0, { targets: [ref(bears), ref(giant)] });
    expect([zone(game, bears), zone(game, giant), zone(game, lions), zone(game, requiem)]).toEqual([
      "graveyard",
      "graveyard",
      "battlefield",
      "graveyard",
    ]);
  });
});

describe("Soul-Shackled Zombie", () => {
  it("exiles two cards from one graveyard and drains when a creature card was among them", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant", B);
    const forest = toGraveyard(game, "Forest", B);
    pickTargets(a, giant, forest);
    enter(game, "Soul-Shackled Zombie");
    expect([zone(game, giant), zone(game, forest)]).toEqual(["exile", "exile"]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Spurnmage Advocate", () => {
  it("needs both cards from one opponent's graveyard, and destroys the attacking creature", () => {
    const { game, b } = table({ players: 3 });
    const advocate = spawn(game, "Spurnmage Advocate");
    const attacker = spawn(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    const forest = toGraveyard(game, "Forest", B);
    const carols = toGraveyard(game, "Hill Giant", C);
    b.declareAttackersFn = () => [{ attacker, defender: A }];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-attackers" && s.priority.holder === A);
    const activation = (targets: readonly string[]): Action =>
      ({
        type: "activate-ability",
        player: A,
        source: advocate,
        abilityIndex: 0,
        targets: targets.map((id) => ref(id as never)),
      }) as Action;
    expect(game.canDispatch(activation([giant, carols, attacker]))).not.toBeNull();
    expect(game.canDispatch(activation([giant, forest, attacker]))).toBeNull();
    const bobsHand = hand(game, B).length;
    game.dispatch(activation([giant, forest, attacker]));
    settle(game);
    expect([zone(game, giant), zone(game, forest), zone(game, carols)]).toEqual(["hand", "hand", "graveyard"]);
    expect(hand(game, B).length).toBe(bobsHand + 2);
    expect(zone(game, attacker)).toBe("graveyard");
  });
});

describe("Waste Management", () => {
  it("unkicked, exiles up to two cards from one graveyard and makes a Rogue per creature card", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = toGraveyard(game, "Hill Giant", B);
    const forest = toGraveyard(game, "Forest", B);
    cast(game, toHand(game, "Waste Management"), { targets: [ref(giant), ref(forest)] });
    expect([zone(game, giant), zone(game, forest)]).toEqual(["exile", "exile"]);
    expect(tokensNamed(game, "Rogue Token", A)).toBe(1);
  });

  it("kicked, exiles the target player's whole graveyard instead", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const cards = [
      toGraveyard(game, "Hill Giant", B),
      toGraveyard(game, "Grizzly Bears", B),
      toGraveyard(game, "Savannah Lions", B),
      toGraveyard(game, "Forest", B),
    ];
    const mine = toGraveyard(game, "Hill Giant", A);
    cast(game, toHand(game, "Waste Management"), { targets: [ref(B)], kicked: true });
    expect(cards.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile", "exile"]);
    expect(zone(game, mine)).toBe("graveyard");
    expect(tokensNamed(game, "Rogue Token", A)).toBe(3);
  });
});
