/**
 * Rule 101.4 for an `each-player-may`: each player chooses in turn order from the active player,
 * knowing the choices before theirs — then the actions happen at once. A card a player chose to
 * discard stays hidden in their hand while the others choose (101.4a), and every sacrifice
 * happens in one event, so a dying Blood Artist sees another player's creature die beside it
 * (603.10a). Tomb of Annihilation's Veils of Fear and Sandfall Cell, Perforating Artist's shape.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  enter,
  graveyard,
  hand,
  life,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const VEILS: EffectSpec = {
  kind: "each-player-may",
  who: "each-player",
  options: [{ discard: 1, text: "Discard a card" }],
  ifDidnt: { kind: "lose-life", amount: 2, who: "that-player" },
};

const SANDFALL: EffectSpec = {
  kind: "each-player-may",
  who: "each-player",
  options: [{ sacrifice: { typesAnyOf: ["creature", "artifact", "land"] }, text: "Sacrifice a creature, artifact, or land" }],
  ifDidnt: { kind: "lose-life", amount: 2, who: "that-player" },
};

describe("each player chooses, then all act (rule 101.4)", () => {
  it("a chosen discard waits, hidden in hand, until every player has chosen", () => {
    const { game, a, b } = table();
    const giant = toHand(game, "Hill Giant", A);
    const bears = toHand(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    a.chooseDiscardsFn = () => [giant];
    b.chooseModesFn = () => [0];
    let seenByBob: string | undefined;
    b.chooseDiscardsFn = () => {
      seenByBob = zone(game, giant);
      return [bears];
    };
    game.debugApplyEffect(A, VEILS);
    settle(game);
    expect(seenByBob).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    // Both discards come after both choices: no discard event before Bob chose.
    const discards = game.state.eventLog.filter((e) => e.type === "cards-discarded");
    expect(discards.map((e) => e.type === "cards-discarded" && e.player)).toEqual([A, B]);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("a player who declines loses the life; one who discards doesn't", () => {
    const { game, a } = table({ players: 3 });
    const giant = toHand(game, "Hill Giant", A);
    a.chooseModesFn = () => [0];
    a.chooseDiscardsFn = () => [giant];
    const before = hand(game, A).length;
    game.debugApplyEffect(A, VEILS);
    settle(game);
    expect(hand(game, A)).toHaveLength(before - 1);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 18, 18]);
  });

  it("every sacrifice happens at once: a sacrificed Blood Artist sees the other player's creature die", () => {
    const { game, a, b } = table();
    const artist = spawn(game, "Blood Artist", A);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Forest", B);
    a.chooseModesFn = () => [0];
    b.chooseModesFn = () => [0];
    let artistWhenBobChose: string | undefined;
    a.chooseSacrificesFn = (_view, eligible) => [eligible.includes(artist) ? artist : eligible[0]!];
    b.chooseSacrificesFn = (_view, eligible) => {
      artistWhenBobChose = zone(game, artist);
      return [eligible.includes(bears) ? bears : (eligible[0] as ObjectId)];
    };
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    game.debugApplyEffect(A, SANDFALL);
    settle(game);
    expect(artistWhenBobChose).toBe("battlefield");
    expect(zone(game, artist)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    // Blood Artist's own death and the Bears' both trigger it: Bob loses 2.
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("the cards it unblocked", () => {
  it("Perforating Artist: after you attacked, each opponent loses 3 unless they sacrifice or discard", () => {
    const { game, a, b, c } = table({ players: 3 });
    const artist = spawn(game, "Perforating Artist");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Forest", B);
    b.chooseModesFn = () => [0];
    b.chooseSacrificesFn = () => [bears];
    c.chooseModesFn = () => [];
    attack(game, a, [artist], B);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    // Bob's attack damage was 3; the punisher cost him nothing more.
    expect(life(game, A)).toBe(20);
  });

  it("Fandaniel: an opponent who doesn't sacrifice loses 2 for each instant and sorcery in your graveyard", () => {
    const { game, b } = table();
    spawn(game, "Fandaniel, Telophoroi Ascian");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock", B);
    b.chooseModesFn = () => [];
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(16);
  });

  it("Osseous Sticktwister: with delirium, deals its power to each opponent who did neither", () => {
    const { game, b } = table();
    spawn(game, "Osseous Sticktwister");
    for (const name of ["Lightning Bolt", "Divination", "Grizzly Bears", "Forest"]) toGraveyard(game, name);
    b.chooseModesFn = () => [];
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("Polygraph Orb: two of the top four to hand, the rest to the graveyard, and you lose 2", () => {
    const { game } = table();
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Grizzly Bears");
    const before = hand(game, A).length;
    const graveyardBefore = graveyard(game, A).length;
    enter(game, "Polygraph Orb");
    expect(hand(game, A)).toHaveLength(before + 2);
    expect(graveyard(game, A)).toHaveLength(graveyardBefore + 2);
    expect(life(game, A)).toBe(18);
  });
});
