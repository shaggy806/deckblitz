import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, graveyard, hand, life, lands, pt, ref, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

// Eventide's retrace (rule 702.81a): cast from your graveyard by discarding a
// land card as an additional cost; unlike flashback nothing exiles it. And
// the untap symbol {Q} (rule 107.6): payable only by a tapped permanent, and
// a creature's only once summoning sickness is past (302.6).

const retraceCasts = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "retrace");

describe("retrace", () => {
  it("casts Raven's Crime from the graveyard, discarding a land, and it goes back there", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const crime = toGraveyard(game, "Raven's Crime");
    expect(retraceCasts(game, crime)[0]).toMatchObject({ altCostText: "retrace, discarding a land card" });
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    cast(game, crime, { via: "retrace", targets: [ref(B)] });
    expect(hand(game)).toHaveLength(mine - 1);
    expect(hand(game, B)).toHaveLength(theirs - 1);
    expect(zone(game, crime)).toBe("graveyard");
    // And again, while the lands last.
    expect(retraceCasts(game, crime)).toHaveLength(1);
  });

  it("isn't offered with no land card in hand", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const crime = toGraveyard(game, "Raven's Crime");
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    toHand(game, "Grizzly Bears");
    expect(retraceCasts(game, crime)).toHaveLength(0);
    expect(() => cast(game, crime, { via: "retrace", targets: [ref(B)] })).toThrow(/no land card/);
  });

  it("counts the land Worm Harvest discarded for its own retrace", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const harvest = toGraveyard(game, "Worm Harvest");
    toGraveyard(game, "Forest");
    cast(game, harvest, { via: "retrace" });
    // The Forest, and the Wastes discarded to cast it.
    expect(tokensNamed(game, "Worm Token")).toBe(2);
    expect(graveyard(game)).toContain(harvest);
  });
});

describe("the untap symbol {Q}", () => {
  it("Patrol Signaler untaps to make a Kithkin Soldier, only while tapped", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const signaler = spawn(game, "Patrol Signaler", A, { tapped: true });
    activate(game, signaler);
    expect(game.state.objects[signaler].tapped).toBe(false);
    expect(tokensNamed(game, "Kithkin Soldier Token")).toBe(1);
    expect(() => activate(game, signaler)).toThrow(/already untapped/);
  });

  it("keeps summoning sickness and a stun counter in mind", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const sick = spawn(game, "Patrol Signaler", A, { tapped: true, sick: true });
    expect(() => activate(game, sick)).toThrow(/summoning sickness/);
    const stunned = spawn(game, "Patrol Signaler", A, { tapped: true });
    game.state.objects[stunned].counters.stun = 1;
    expect(() => activate(game, stunned)).toThrow(/stun counter/);
  });

  it("Hateflayer untaps to deal damage equal to its power", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const flayer = spawn(game, "Hateflayer", A, { tapped: true });
    activate(game, flayer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });

  it("Umbral Mantle grants its {Q} pump to the equipped creature", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const mantle = spawn(game, "Umbral Mantle");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    activate(game, mantle, 0, { targets: [ref(bears)] });
    const pump = game
      .legalActions(A)
      .find((a) => a.kind === "activate-ability" && a.source === bears);
    expect(pump).toBeDefined();
    activate(game, bears, (pump as { abilityIndex: number }).abilityIndex);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears).power).toBe(4);
  });
});

describe("retrace beyond Eventide", () => {
  it("Formless Genesis makes an X/X for the lands in your graveyard as it resolves", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const genesis = toGraveyard(game, "Formless Genesis");
    toGraveyard(game, "Forest");
    cast(game, genesis, { via: "retrace" });
    const token = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Shapeshifter Token (X/X Changeling Deathtouch)",
    );
    expect(token).toBeDefined();
    expect(pt(game, token as ObjectId)).toEqual({ power: 2, toughness: 2 });
  });
});
