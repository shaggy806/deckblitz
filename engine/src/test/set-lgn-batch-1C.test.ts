/**
 * Mirrodin (MRD) leftovers and Legions (LGN) — B219 group c.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const hit = (game: Game, source: ObjectId, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [ref(A)], { source });

describe("LGN group C", () => {
  it("Neurok Familiar puts an artifact into hand, anything else into the graveyard", () => {
    const { game } = table();
    const top = toLibrary(game, "Sol Ring");
    enter(game, "Neurok Familiar");
    expect(zone(game, top)).toBe("hand");
    const land = toLibrary(game, "Forest");
    enter(game, "Neurok Familiar");
    expect(zone(game, land)).toBe("graveyard");
  });

  it("Beacon of Destiny takes the chosen source's next damage to you", () => {
    const { game, a } = table();
    const beacon = spawn(game, "Beacon of Destiny");
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, beacon);
    hit(game, goblin, 2);
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[beacon].damageMarked).toBe(2);
    hit(game, goblin, 1);
    expect(life(game, A)).toBe(19);
  });

  it("Mistform Sliver grants a Sliver an added creature type of its controller's choice", () => {
    const { game, a } = table();
    spawn(game, "Mistform Sliver", B);
    const mine = spawn(game, "Muscle Sliver");
    lands(game, "Island", 1);
    a.chooseCreatureTypeFn = () => "Elf";
    activate(game, mine, 0);
    expect(subtypes(game, mine)).toEqual(expect.arrayContaining(["Sliver", "Elf"]));
  });

  it("Primal Whisperer gets +2/+2 for each face-down creature, each player's", () => {
    const { game } = table();
    const whisperer = spawn(game, "Primal Whisperer");
    lands(game, "Wastes", 3);
    lands(game, "Wastes", 3, B);
    cast(game, toHand(game, "Skirk Marauder"), { via: "face-down" } as Partial<Extract<Action, { type: "cast-spell" }>>);
    expect(pt(game, whisperer)).toEqual({ power: 4, toughness: 4 });
  });

  it("Skirk Marauder deals 2 damage to any target when turned face up", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const marauder = toHand(game, "Skirk Marauder");
    cast(game, marauder, { via: "face-down" } as Partial<Extract<Action, { type: "cast-spell" }>>);
    pickTargets(a, B);
    game.dispatch({ type: "turn-face-up", player: A, permanent: marauder, morph: true } as Action);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game, B)).toBe(18);
  });

  it("Drinker of Sorrow sacrifices one permanent per combat damage", () => {
    const { game, a } = table();
    const drinker = spawn(game, "Drinker of Sorrow");
    const land = spawn(game, "Swamp");
    let asked = 0;
    a.chooseSacrificesFn = () => {
      asked += 1;
      return [land];
    };
    attack(game, a, [drinker]);
    expect(asked).toBe(1);
    expect(life(game, B)).toBe(15);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, drinker)).toBe("battlefield");
  });

  it("Frenetic Raptor: Beasts can't block, other creatures can", () => {
    const { game, a } = table();
    spawn(game, "Frenetic Raptor", B);
    const beast = spawn(game, "Groffskithur", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [attacker]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(bears);
    expect(blockers).not.toContain(beast);
  });

  it("Groffskithur may return a Groffskithur from the graveyard when it becomes blocked", () => {
    const { game, a, b } = table();
    const groff = spawn(game, "Groffskithur");
    const other = toGraveyard(game, "Groffskithur");
    const wall = spawn(game, "Wall of Stone", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: groff }];
    pickTargets(a, other);
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [groff]);
    expect(zone(game, other)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game)).not.toContain(other);
  });
});
