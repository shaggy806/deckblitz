/**
 * Prohibitions on playing lands and on casting from a zone (rules 101.2,
 * 305.2, 601.3): "target player can't play lands this turn" (the `prohibit`
 * effect's `lands` — Turf Wound, Pardic Miner), "players can't play lands"
 * (a static `prohibits.lands` of `{}` — Territorial Dispute), and a static
 * prohibition reaching only cards in some zones, or only cards outside them
 * (`prohibits.from` / `notFrom` — Experimental Frenzy, Drannith Magistrate),
 * judged where the card is as the cast or the play begins (601.2a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, hand, lands, nextTurn, ref, spawn, table, toGraveyard, toHand, toLibrary } from "./harness.js";

const canPlay = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "play-land" && a.card === card);
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("can't play lands this turn (the prohibit effect's lands)", () => {
  it("Turf Wound: the target player can't play a land this turn, and draws nothing for it — the caster draws", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const forest = toHand(game, "Forest");
    expect(canPlay(game, forest)).toBe(true);
    const before = hand(game).length;
    cast(game, toHand(game, "Turf Wound"), { targets: [ref(A)] });
    expect(hand(game).length).toBe(before + 1);
    expect(canPlay(game, forest)).toBe(false);
    expect(() => game.dispatch({ type: "play-land", player: A, card: forest })).toThrow(/can't play lands/);
  });

  it("Turf Wound: a land from the library's top is barred too, and the next turn lands are back", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Future Sight");
    cast(game, toHand(game, "Turf Wound"), { targets: [ref(A)] });
    const top = toLibrary(game, "Forest");
    expect(canPlay(game, top)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    const next = toHand(game, "Forest");
    expect(canPlay(game, next)).toBe(true);
  });

  it("Turf Wound at another player leaves the caster free to play a land", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Turf Wound"), { targets: [ref(B)] });
    expect(game.state.turnProhibitions?.players).toEqual([{ player: B, spells: false, abilities: false, lands: true }]);
    expect(canPlay(game, toHand(game, "Forest"))).toBe(true);
  });

  it("Pardic Miner: sacrificed, the target player can't play lands this turn", () => {
    const { game } = table();
    const miner = spawn(game, "Pardic Miner");
    const forest = toHand(game, "Forest");
    activate(game, miner, 0, { targets: [ref(A)] });
    expect(game.state.objects[miner].zone).toBe("graveyard");
    expect(canPlay(game, forest)).toBe(false);
  });
});

describe("players can't play lands (a static's lands)", () => {
  it("Territorial Dispute binds every player, its controller included, and not casting spells", () => {
    const { game } = table();
    spawn(game, "Territorial Dispute", B);
    lands(game, "Mountain", 1);
    const forest = toHand(game, "Forest");
    expect(canPlay(game, forest)).toBe(false);
    expect(canCast(game, toHand(game, "Shock"))).toBe(true);
  });

  it("Territorial Dispute: its own controller can't play one either, until it's gone", () => {
    const { game } = table();
    const dispute = spawn(game, "Territorial Dispute");
    const forest = toHand(game, "Forest");
    expect(canPlay(game, forest)).toBe(false);
    game.debugMove(dispute, "graveyard");
    expect(canPlay(game, forest)).toBe(true);
  });
});

describe("a prohibition by zone (prohibits.from / notFrom)", () => {
  it("Drannith Magistrate: an opponent can cast from their hand but not flash back from their graveyard", () => {
    const { game } = table();
    spawn(game, "Drannith Magistrate", B);
    lands(game, "Island", 3);
    const inHand = toHand(game, "Think Twice");
    const inGraveyard = toGraveyard(game, "Think Twice");
    expect(canCast(game, inHand)).toBe(true);
    expect(canCast(game, inGraveyard)).toBe(false);
    expect(() => cast(game, inGraveyard)).toThrow(/can't cast/);
  });

  it("Drannith Magistrate: nor cast from the library's top, while a land still plays from there", () => {
    const { game } = table();
    spawn(game, "Drannith Magistrate", B);
    spawn(game, "Future Sight");
    lands(game, "Island", 3);
    const topSpell = toLibrary(game, "Think Twice");
    expect(canCast(game, topSpell)).toBe(false);
    game.debugMove(topSpell, "graveyard");
    const topLand = toLibrary(game, "Forest");
    expect(canPlay(game, topLand)).toBe(true);
  });

  it("Drannith Magistrate leaves its own controller alone (the control)", () => {
    const { game } = table();
    spawn(game, "Drannith Magistrate");
    lands(game, "Island", 3);
    expect(canCast(game, toGraveyard(game, "Think Twice"))).toBe(true);
  });

  it("Experimental Frenzy: no land and no spell from the hand, both from the library's top", () => {
    const { game } = table();
    spawn(game, "Experimental Frenzy");
    lands(game, "Mountain", 3);
    const handLand = toHand(game, "Forest");
    const handSpell = toHand(game, "Shock");
    expect(canPlay(game, handLand)).toBe(false);
    expect(canCast(game, handSpell)).toBe(false);
    const topSpell = toLibrary(game, "Shock");
    expect(canCast(game, topSpell)).toBe(true);
    game.debugMove(topSpell, "graveyard");
    const topLand = toLibrary(game, "Forest");
    expect(canPlay(game, topLand)).toBe(true);
  });

  it("Experimental Frenzy binds only its controller", () => {
    const { game } = table();
    spawn(game, "Experimental Frenzy", B);
    lands(game, "Island", 3);
    expect(canCast(game, toHand(game, "Think Twice"))).toBe(true);
    expect(canPlay(game, toHand(game, "Forest"))).toBe(true);
  });

  it("Experimental Frenzy: a graveyard cast isn't from the hand", () => {
    const { game } = table();
    spawn(game, "Experimental Frenzy");
    lands(game, "Island", 3);
    expect(canCast(game, toGraveyard(game, "Think Twice"))).toBe(true);
  });

  it("a player-effect's cantCast from the hand (Memory Vessel's lock): hand barred until the controller's next turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    game.debugApplyEffect(
      B,
      {
        kind: "player-effect",
        duration: "until-your-next-turn",
        cantCast: { who: "each-player", filter: {}, label: "cards from their hand", lands: true, from: ["hand"] },
      },
      [],
    );
    const handLand = toHand(game, "Forest");
    expect(canPlay(game, handLand)).toBe(false);
    expect(canCast(game, toHand(game, "Think Twice"))).toBe(false);
    expect(canCast(game, toGraveyard(game, "Think Twice"))).toBe(true);
    nextTurn(game);
    expect(game.state.playerEffects ?? []).toEqual([]);
    nextTurn(game);
    expect(canPlay(game, handLand)).toBe(true);
  });

  it("Experimental Frenzy: {3}{R} destroys it, and the hand opens again", () => {
    const { game } = table();
    const frenzy = spawn(game, "Experimental Frenzy");
    lands(game, "Mountain", 4);
    const handLand = toHand(game, "Forest");
    activate(game, frenzy);
    expect(game.state.objects[frenzy].zone).toBe("graveyard");
    expect(canPlay(game, handLand)).toBe(true);
  });
});
