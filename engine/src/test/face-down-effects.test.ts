import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { intrinsicManaColors } from "../characteristics.js";
import { FACE_DOWN_AS_CARDS, FACE_DOWN_CARDS } from "../state.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  loyalty,
  pickFromZone,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

/**
 * Face down by an effect (rule 708.2): turned face down (Cyber Conversion)
 * or put onto the battlefield face down (Yedora, Tezzeret) — a 2/2, or the
 * characteristics the effect lists — neither manifested nor cloaked, so
 * turned face up only by a morph or disguise cost (702.37e); manifest from
 * another player's library (Orochi Soul-Reaver, 110.2a); and a permanent
 * that can't be turned face up (Unable to Scream).
 */

const canTurnUp = (game: Game, permanent: ObjectId, player: PlayerId = A, morph = false): boolean =>
  game.legalActions(player).some(
    (a) => a.kind === "turn-face-up" && a.permanent === permanent && (a.morph !== undefined) === morph,
  );

const turnUp = (game: Game, permanent: ObjectId, player: PlayerId = A, morph = false): void => {
  game.dispatch({ type: "turn-face-up", player, permanent, ...(morph ? { morph: true } : {}) } as Action);
};

describe("turn-face-down (Cyber Conversion)", () => {
  it("turns a creature into a face-down 2/2 Cyberman artifact creature, the same permanent", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters["+1/+1"] = 1;
    const conversion = toHand(game, "Cyber Conversion");
    cast(game, conversion, { targets: [ref(giant)] });

    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown).toEqual({ kind: "effect", as: "2/2 Cyberman artifact creature" });
    expect(types(game, giant)).toEqual(["artifact", "creature"]);
    expect(subtypes(game, giant)).toEqual(["Cyberman"]);
    // Its counter stays (it never left): a 2/2 with a +1/+1 counter.
    expect(counters(game, giant)).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(game.characteristics(giant).colors.size).toBe(0);
    // Only its controller may look at it (708.5).
    expect(game.viewFor(B).objects[giant]?.faceDown).toEqual({ kind: "effect", card: "Hill Giant" });
    expect(game.viewFor(A).objects[giant]?.faceDown).toEqual({ kind: "effect" });
    expect(game.viewFor(A).objects[giant]?.cardName).toBe(FACE_DOWN_AS_CARDS["2/2 Cyberman artifact creature"]);
    expect(game.state.eventLog.some((e) => e.type === "permanent-turned-face-down" && e.object === giant)).toBe(true);
  });

  it("can't be turned face up for its mana cost — only for a morph cost", () => {
    const { game } = table();
    lands(game, "Island", 10, B);
    const giant = spawn(game, "Hill Giant", B);
    const alchemist = spawn(game, "Aphetto Alchemist", B);
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(giant)]);
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(alchemist)]);
    expect(game.state.objects[giant].faceDown).toEqual({ kind: "effect" });
    expect(game.characteristics(giant)).toMatchObject({ power: 2, toughness: 2, types: ["creature"] });
    // Hill Giant has no morph: it stays face down (701.40b is manifest's).
    game.advanceUntil((s) => s.priority.holder === B);
    expect(canTurnUp(game, giant, B)).toBe(false);
    expect(() => turnUp(game, giant, B)).toThrow();
    // Aphetto Alchemist's morph {1}{U} turns it up (702.37e).
    expect(canTurnUp(game, alchemist, B)).toBe(false);
    expect(canTurnUp(game, alchemist, B, true)).toBe(true);
    turnUp(game, alchemist, B, true);
    expect(game.state.objects[alchemist].faceDown).toBeUndefined();
  });

  it("does nothing to a permanent already face down (708.2b)", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "manifest", who: "you" });
    const bears = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].faceDown !== undefined);
    expect(bears).toBeDefined();
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0, as: "2/2 Cyberman artifact creature" }, [
      ref(bears as ObjectId),
    ]);
    // Still a manifested 2/2: no Cyberman, and still turned up for {1}{G}.
    expect(game.state.objects[bears as ObjectId].faceDown).toEqual({ kind: "manifest" });
    expect(types(game, bears as ObjectId)).toEqual(["creature"]);
  });

  it("is revealed as it leaves, and is its own card again in the graveyard", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0, as: "2/2 Cyberman artifact creature" }, [ref(giant)]);
    destroy(game, giant, A);
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[giant].faceDown).toBeUndefined();
    expect(game.viewFor(A).objects[giant]?.cardName).toBe("Hill Giant");
  });
});

describe("entering face down by an effect", () => {
  it("Yedora returns a dying nontoken creature face down as a Forest land that taps for {G}", () => {
    const { game, a } = table();
    spawn(game, "Yedora, Grave Gardener");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, bears);
    settle(game);

    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears]).toMatchObject({ controller: A, faceDown: { kind: "effect", as: "Forest land" } });
    expect(types(game, bears)).toEqual(["land"]);
    expect(subtypes(game, bears)).toEqual(["Forest"]);
    expect(game.viewFor(B).objects[bears]?.cardName).toBe(FACE_DOWN_AS_CARDS["Forest land"]);
    // Forest's intrinsic "{T}: Add {G}" (rule 305.6).
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[bears])).toEqual(["G"]);
    // Not a manifested creature: never turned face up for {1}{G}.
    lands(game, "Forest", 2);
    expect(canTurnUp(game, bears)).toBe(false);
  });

  it("Tezzeret's −7 puts any cards from hand face down as 5/5 artifact creatures, their enters abilities silent", () => {
    const { game, a } = table();
    const tezzeret = spawn(game, "Tezzeret, Cruel Machinist");
    const visionary = toHand(game, "Elvish Visionary");
    const bolt = toHand(game, "Lightning Bolt");
    const kept = toHand(game, "Grizzly Bears");
    pickFromZone(a, visionary, bolt);
    const before = hand(game).length;
    loyalty(game, tezzeret, -7, { atLeast: 7 });

    for (const id of [visionary, bolt]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].faceDown).toEqual({ kind: "effect", as: "5/5 artifact creature" });
      expect(types(game, id)).toEqual(["artifact", "creature"]);
      expect(pt(game, id)).toEqual({ power: 5, toughness: 5 });
    }
    expect(zone(game, kept)).toBe("hand");
    // Elvish Visionary's "when this enters, draw a card" doesn't trigger (708.3).
    expect(hand(game).length).toBe(before - 2);
    expect(graveyard(game)).not.toContain(bolt);
  });
});

describe("from another player's library onto the battlefield face down (Cybership's shape)", () => {
  it("puts that player's top cards face down as Cybermen under the effect's controller (rule 110.2a)", () => {
    const { game, a } = table();
    const second = toLibrary(game, "Lightning Bolt", B);
    const first = toLibrary(game, "Grizzly Bears", B);
    pickFromZone(a, first, second);
    game.debugApplyEffect(
      A,
      {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 2,
        min: 2,
        max: 2,
        destination: "battlefield",
        leftover: "stay",
        enterAs: { faceDown: "2/2 Cyberman artifact creature" },
      },
      [ref(B)],
    );
    settle(game);
    for (const id of [first, second]) {
      expect(game.state.objects[id]).toMatchObject({
        zone: "battlefield",
        owner: B,
        controller: A,
        faceDown: { kind: "effect", as: "2/2 Cyberman artifact creature" },
      });
      expect(subtypes(game, id)).toEqual(["Cyberman"]);
    }
  });
});

describe("manifest from another player's library (Orochi Soul-Reaver)", () => {
  it("manifests the damaged player's top card under its controller's control", () => {
    const { game, a } = table();
    const orochi = spawn(game, "Orochi Soul-Reaver");
    const bears = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [orochi]);

    expect(game.state.objects[bears]).toMatchObject({
      zone: "battlefield",
      owner: B,
      controller: A,
      faceDown: { kind: "manifest" },
    });
    // Its controller sees it; its owner doesn't (708.5).
    expect(game.viewFor(A).objects[bears]?.faceDown).toEqual({ kind: "manifest", card: "Grizzly Bears" });
    expect(game.viewFor(B).objects[bears]?.faceDown).toEqual({ kind: "manifest" });
    expect(game.state.eventLog.some((e) => e.type === "card-manifested" && e.object === bears && e.library === B)).toBe(
      true,
    );
    // A Treasure too, and the manifested creature turned up for its {1}{G}.
    lands(game, "Forest", 2);
    expect(canTurnUp(game, bears)).toBe(true);
    turnUp(game, bears);
    expect(game.state.objects[bears].faceDown).toBeUndefined();
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("can't be turned face up (Unable to Scream)", () => {
  it("keeps the enchanted face-down creature face down", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    toLibrary(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "manifest", who: "you" });
    const bears = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].faceDown !== undefined) as ObjectId;
    expect(canTurnUp(game, bears)).toBe(true);
    const aura = toHand(game, "Unable to Scream");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[aura].attachedTo).toBe(bears);
    expect(canTurnUp(game, bears)).toBe(false);
    expect(() => turnUp(game, bears)).toThrow(/can't be turned face up/);
    // A Toy artifact creature with base 0/2, face down still.
    expect(subtypes(game, bears)).toContain("Toy");
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
  });
});

describe("face-down definitions", () => {
  it("names a plain effect's face-down permanent the manifest 2/2", () => {
    expect(FACE_DOWN_CARDS.effect).toBe(FACE_DOWN_CARDS.manifest);
  });
});
