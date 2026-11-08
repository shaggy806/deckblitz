/**
 * One `Duration`, one `Expiry`, and the timed static (docs/plans/
 * need-key-themes.md, theme 3's design note): a player effect anchored to
 * any player's next turn, one that waits for "their next turn", and a
 * static ability that lasts a while — each on the cards that proved it.
 */

import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import { resolvePlayerDuration } from "../duration.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  lands,
  life,
  loyalty,
  nextTurn,
  pickModes,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** `player` gains 3 life from Healing Salve, cast by alice. */
const salve = (game: Game, player: PlayerId): void => {
  lands(game, "Plains", 1);
  cast(game, toHand(game, "Healing Salve"), { targets: [ref(player)], modes: [0] });
};

/** Untapped and not summoning sick. */
const ready = (game: Game, name: string, player: PlayerId): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  return id;
};

describe("resolvePlayerDuration", () => {
  const players: Record<string, PlayerId> = { "that-player": B };
  const of = (ref: unknown): PlayerId | undefined => players[ref as string];
  it("reads each player-side duration once", () => {
    expect(resolvePlayerDuration("end-of-turn", A, of)).toEqual({ expires: "end-of-turn" });
    expect(resolvePlayerDuration("until-end-of-combat", A, of)).toEqual({ expires: { untilEndOfCombat: true } });
    expect(resolvePlayerDuration("until-your-next-turn", A, of)).toEqual({ expires: { untilTurnOf: A } });
    expect(resolvePlayerDuration({ untilTurnOf: "that-player" }, A, of)).toEqual({ expires: { untilTurnOf: B } });
    expect(resolvePlayerDuration({ throughTurnOf: "that-player" }, A, of)).toEqual({
      expires: { untilPoint: { point: "turn-ends", player: B } },
    });
    expect(resolvePlayerDuration({ duringTurnOf: "that-player" }, A, of)).toEqual({ during: B });
    // Naming nobody: nothing is made.
    expect(resolvePlayerDuration({ untilTurnOf: "trigger-player" }, A, of)).toBeUndefined();
  });
});

describe("players can't gain life this turn (a timed static)", () => {
  it("stops every gain until cleanup, isn't an emblem at the table, and goes (Skullcrack)", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Skullcrack"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    salve(game, B);
    salve(game, A);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
    expect(game.state.emblems).toHaveLength(1);
    expect(viewFor(game.state, registryOf(game), A).emblems).toEqual([]);
    nextTurn(game);
    expect(game.state.emblems).toEqual([]);
    game.advanceUntil((s) => s.priority.holder === A);
    salve(game, B);
    expect(life(game, B)).toBe(20);
  });

  it("can't be prevented, from the same spell (Call In a Professional)", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters.shield = 1;
    cast(game, toHand(game, "Call In a Professional"), { targets: [ref(bears)] });
    // The shield counter's prevention prevents none of it, but it goes.
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("is only the opponents' when it says so (Roiling Vortex)", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const vortex = spawn(game, "Roiling Vortex");
    activate(game, vortex, 0);
    salve(game, B);
    salve(game, A);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(23);
  });
});

describe("until that player's next turn (Teferi's Reproach)", () => {
  it("protects the target and fixes its life until its turn begins, its permanents phased out until it untaps", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const swamp = spawn(game, "Swamp", B);
    const reproach = toHand(game, "Teferi's Reproach");
    cast(game, reproach, { targets: [ref(B)] });
    expect(zone(game, reproach)).toBe("exile");
    expect(game.state.objects[bears].phasedOut).toBeDefined();
    expect(game.state.objects[swamp].phasedOut).toBeUndefined();
    // Protection from everything: Healing Salve can't target him; his life
    // total can't change.
    expect(() => salve(game, B)).toThrow(/illegal target/);
    expect(game.state.playerEffects?.[0]).toMatchObject({ expires: { untilTurnOf: B }, lifeCantChange: [B] });
    // Bob's turn: over, and his creature is back.
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.playerEffects ?? []).toEqual([]);
    expect(game.state.objects[bears].phasedOut).toBeUndefined();
  });
});

describe("during their next turn (a player effect that waits)", () => {
  it("binds the damaged player only within their next turn (Willie Lumpkin, Postman)", () => {
    const { game, a, b } = table({ players: 3 });
    const willie = ready(game, "Willie Lumpkin, Postman", A);
    const bears = ready(game, "Grizzly Bears", B);
    pickModes(b, 0);
    attack(game, a, [willie]);
    a.declareAttackersFn = () => [];
    expect(life(game, B)).toBe(19);
    // Nothing yet: it waits for Bob's turn.
    expect(game.state.playerEffects ?? []).toEqual([]);
    expect(game.state.laterPlayerEffects).toHaveLength(1);
    // Bob's turn: he can't attack Alice, or a permanent she controls; Carol
    // he can.
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(whyCannotAttack(game.state, registryOf(game), B, bears, A)).toMatch(/can't attack/);
    expect(whyCannotAttack(game.state, registryOf(game), B, bears, C)).toBeNull();
    // Carol's turn, then Alice's, then Bob's again: free.
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect([game.state.playerEffects, game.state.laterPlayerEffects]).toEqual([[], undefined]);
    expect(whyCannotAttack(game.state, registryOf(game), B, bears, A)).toBeNull();
  });

  it("asks each player, and binds each opponent who took a Sanctum (Zagorka, Mother of Sanctum)", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Zagorka, Mother of Sanctum");
    const bobs = ready(game, "Grizzly Bears", B);
    const carols = ready(game, "Grizzly Bears", C);
    pickModes(a);
    pickModes(b, 0);
    pickModes(c);
    toStep(game, "end");
    settle(game);
    const sanctums = Object.values(game.state.objects).filter((o) => o.cardName === "Sanctum Token");
    expect(sanctums.map((o) => [o.controller, o.tapped])).toEqual([[B, true]]);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(whyCannotAttack(game.state, registryOf(game), B, bobs, A)).toMatch(/can't attack/);
    nextTurn(game);
    expect(whyCannotAttack(game.state, registryOf(game), C, carols, A)).toBeNull();
  });
});

describe("timed statics that change other rules", () => {
  it("turns off the legend rule for your permanents this turn (Hall of Echoes)", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const hall = spawn(game, "Hall of Echoes");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    activate(game, hall, 1, { targets: [ref(isamaru)] });
    expect(zone(game, hall)).toBe("battlefield");
    expect(zone(game, isamaru)).toBe("battlefield");
    // A third Isamaru, later this turn: still none goes.
    const third = spawn(game, "Isamaru, Hound of Konda");
    settle(game);
    expect(zone(game, third)).toBe("battlefield");
    // Next turn the copy has ended and the rule is back: one of the two goes.
    nextTurn(game);
    const isamarus = Object.values(game.state.objects).filter(
      (o) => o.cardName === "Isamaru, Hound of Konda" && o.zone === "battlefield",
    );
    expect(isamarus).toHaveLength(1);
  });

  it("lets Jaces you control use loyalty at instant speed this turn, and no other planeswalker (Jace's Machinations)", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const liliana = spawn(game, "Liliana of the Veil");
    const aliceOnBobsUpkeep = (s: Game["state"]): boolean =>
      activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A && s.zones.shared.stack.length === 0;
    game.advanceUntil(aliceOnBobsUpkeep);
    cast(game, toHand(game, "Jace's Machinations"));
    game.advanceUntil(aliceOnBobsUpkeep);
    const jace = Object.values(game.state.objects).find((o) => o.zone === "battlefield" && o.cardName.startsWith("Jace"));
    expect(jace?.counters.loyalty).toBe(8);
    expect(game.state.emblems.map((e) => e.expires)).toEqual(["end-of-turn"]);
    // Bob's upkeep: Jace's −1 is Alice's to activate; Liliana's +1 isn't.
    const plus = registryOf(game).get("Liliana of the Veil").activated.findIndex((x) => x.loyaltyCost === 1);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: liliana, abilityIndex: plus, targets: [] })).toMatch(
      /own turn/,
    );
    loyalty(game, jace?.id as ObjectId, -1, { player: A });
    expect(game.state.objects[jace?.id as ObjectId].counters.loyalty).toBe(7);
    // Gone with the turn.
    nextTurn(game);
    expect(game.state.emblems).toEqual([]);
  });
});

describe("this combat, not this turn (Master of Cruelties)", () => {
  it("sets an unblocked attack's player to 1 and assigns no damage only in that combat", () => {
    const { game, a } = table();
    const master = ready(game, "Master of Cruelties", A);
    attack(game, a, [master]);
    a.declareAttackersFn = () => [];
    // Set to 1, and none of its damage after: it would be 0 otherwise.
    expect(life(game, B)).toBe(1);
    const mods = game.state.objects[master].modifiers.filter((m) => m.assignsNoCombatDamage === true);
    // Gone with the combat it was made in.
    expect(mods).toEqual([]);
  });

  it("doesn't trigger attacking a planeswalker", () => {
    const { game, a } = table();
    const master = ready(game, "Master of Cruelties", A);
    const walker = spawn(game, "Liliana of the Veil", B);
    attack(game, a, [master], walker);
    expect(life(game, B)).toBe(20);
    // It dealt its damage: no trigger said otherwise.
    expect(game.state.objects[walker].counters.loyalty).toBe(2);
  });
});

describe("until this card is cast from exile (Emrakul, the Exigent Doom)", () => {
  it("gives the land {T}: Add {C}{C} until Emrakul is cast from exile", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    lands(game, "Wastes", 3);
    const emrakul = toHand(game, "Emrakul, the Exigent Doom");
    activate(game, emrakul, 0, { targets: [ref(land)] });
    expect(zone(game, emrakul)).toBe("exile");
    expect(game.state.objects[land].modifiers.some((m) => m.untilCast?.card === emrakul)).toBe(true);
  });
});

describe("during that player's next turn, a prohibition (Sphinx's Decree, Azor)", () => {
  it("stops each opponent's instants and sorceries only within their own next turn", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Sphinx's Decree"));
    expect(game.state.laterPlayerEffects?.map((e) => e.turnOf)).toEqual([B, C]);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: bolt, targets: [ref(A)] })).toMatch(/can't cast/);
    // Carol's turn: Bob may again, Carol may not.
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(C);
    expect(game.state.laterPlayerEffects).toBeUndefined();
    expect(game.state.playerEffects?.map((e) => e.cantCast?.players)).toEqual([[C]]);
  });

  it("is Azor's as it enters", () => {
    const { game } = table();
    const azor = toHand(game, "Azor, the Lawbringer");
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    lands(game, "Wastes", 2);
    cast(game, azor);
    expect(game.state.laterPlayerEffects?.map((e) => e.turnOf)).toEqual([B]);
  });
});
