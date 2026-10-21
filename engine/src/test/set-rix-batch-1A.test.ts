/**
 * Rivals of Ixalan, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { invalidateComputedCache } from "../characteristics.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  lands,
  life,
  loyalty,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Angrath, the Flame-Chained", () => {
  it("−3: the stolen creature is sacrificed at the end step only if its mana value is 3 or less", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, the Flame-Chained");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    loyalty(game, angrath, -3, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");

    const angrath2 = spawn(game, "Angrath, the Flame-Chained", B);
    const giant = spawn(game, "Hill Giant", A);
    loyalty(game, angrath2, -3, { player: B, targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(B);
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
  });

  it("−8: each opponent loses life equal to the cards in their own graveyard", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, the Flame-Chained");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears", A);
    loyalty(game, angrath, -8, { atLeast: 8 });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Charging Tuskodon", () => {
  it("deals double combat damage to the defending player", () => {
    const { game, a } = table();
    const tusk = spawn(game, "Charging Tuskodon");
    attack(game, a, [tusk]);
    expect(life(game, B)).toBe(12);
  });
});

describe("Blazing Hope", () => {
  it("targets only a creature with power at least your life total", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    const hope = toHand(game, "Blazing Hope");
    const at = (target: ObjectId): Action => ({ type: "cast-spell", player: A, card: hope, targets: [ref(target)] });
    expect(game.canDispatch(at(bears))).not.toBeNull();
    game.state.players[A].life = 2;
    invalidateComputedCache();
    cast(game, hope, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Golden Demise", () => {
  it("without the blessing hits every creature; with a tenth permanent, only opponents'", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Golden Demise"));
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.players[A].citysBlessing).not.toBe(true);

    const mine2 = spawn(game, "Grizzly Bears");
    const theirs2 = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    // Nine Swamps and the Bears: ten permanents as it resolves.
    cast(game, toHand(game, "Golden Demise"));
    expect(game.state.players[A].citysBlessing).toBe(true);
    expect(zone(game, mine2)).toBe("battlefield");
    expect(zone(game, theirs2)).toBe("graveyard");
  });
});

describe("Twilight Prophet", () => {
  it("with the blessing, puts the top card into your hand and drains its mana value", () => {
    const { game } = table();
    spawn(game, "Twilight Prophet");
    game.state.players[A].citysBlessing = true;
    invalidateComputedCache();
    const giant = toLibrary(game, "Hill Giant");
    toStep(game, "draw");
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("does nothing without the blessing", () => {
    const { game } = table();
    spawn(game, "Twilight Prophet");
    const giant = toLibrary(game, "Hill Giant");
    toStep(game, "draw");
    expect(life(game, B)).toBe(20);
    // Drawn in the draw step, not put there by the Prophet.
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, A)).toBe(20);
  });
});

describe("Form of the Dinosaur", () => {
  it("sets your life to 15, then each upkeep fights an opponent's creature", () => {
    const { game, a } = table();
    game.state.players[A].life = 30;
    invalidateComputedCache();
    enter(game, "Form of the Dinosaur");
    expect(life(game, A)).toBe(15);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    toStep(game, "draw");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(12);
  });

  it("gains up to 15 from below", () => {
    const { game } = table();
    game.state.players[A].life = 4;
    invalidateComputedCache();
    enter(game, "Form of the Dinosaur");
    expect(life(game, A)).toBe(15);
  });
});

describe("Curious Obsession", () => {
  it("is sacrificed at your end step if you didn't attack, and kept if you did", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    const first = toHand(game, "Curious Obsession");
    cast(game, first, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(zone(game, first)).toBe("graveyard");

    toStep(game, "precombat-main");
    const second = toHand(game, "Curious Obsession");
    cast(game, second, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    nextTurn(game);
    expect(zone(game, second)).toBe("battlefield");
    expect(graveyard(game).filter((id) => id === second)).toHaveLength(0);
  });
});

describe("Siren Reaver", () => {
  it("costs {1} less once you've attacked this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const reaver = toHand(game, "Siren Reaver");
    const castIt: Action = { type: "cast-spell", player: A, card: reaver, targets: [] };
    expect(game.canDispatch(castIt)).not.toBeNull();
    attack(game, a, [bears]);
    cast(game, reaver);
    expect(zone(game, reaver)).toBe("battlefield");
  });
});

describe("Sea Legs", () => {
  it("+0/+2 on a Pirate, -2/-0 on anything else", () => {
    const { game } = table();
    const pirate = spawn(game, "Grasping Scoundrel");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Sea Legs"), { targets: [ref(pirate)] });
    cast(game, toHand(game, "Sea Legs"), { targets: [ref(bears)] });
    expect(pt(game, pirate)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
  });
});

describe("Dire Fleet Neckbreaker", () => {
  it("gives attacking Pirates, itself included, +2/+0", () => {
    const { game, a } = table();
    const neck = spawn(game, "Dire Fleet Neckbreaker");
    const scoundrel = spawn(game, "Grasping Scoundrel");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, neck)).toEqual({ power: 3, toughness: 2 });
    attack(game, a, [neck, scoundrel, bears]);
    // 5 + (1 + 1 + 2) + 2 combat damage.
    expect(life(game, B)).toBe(20 - 5 - 4 - 2);
  });
});

describe("Illustrious Wanderglyph", () => {
  it("makes a Gnome at each upkeep, and pumps other artifact creatures with the blessing", () => {
    const { game } = table();
    const glyph = spawn(game, "Illustrious Wanderglyph");
    nextTurn(game);
    const gnomes = game.battlefield.filter((id) => game.state.objects[id].cardName === "Gnome Token");
    expect(gnomes).toHaveLength(1);
    expect(pt(game, gnomes[0])).toEqual({ power: 1, toughness: 1 });
    game.state.players[A].citysBlessing = true;
    invalidateComputedCache();
    expect(pt(game, gnomes[0])).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, glyph)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Frilled Deathspitter", () => {
  it("enrage: deals 2 damage to target opponent when it's dealt damage", () => {
    const { game, a } = table();
    const spitter = spawn(game, "Frilled Deathspitter");
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(spitter)]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(life(game, B)).toBe(18);
  });
});
