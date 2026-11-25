/**
 * A card in a hand that every player saw go there stays known to them
 * (`VisibleObject.knownToAll`): bounced from the battlefield, returned from a
 * graveyard, revealed by the tutor that put it there. A card drawn stays its
 * owner's alone.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("cards every player knows in a hand", () => {
  it("a bounced creature is known in its owner's hand, to everyone, on later turns too", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(bears)] });
    expect(game.viewFor(B).zones.hands[B]).toContain(bears);
    expect(game.viewFor(A).objects[bears]).toMatchObject({ cardName: "Grizzly Bears", knownToAll: true });
    expect(game.viewFor(B).objects[bears]?.knownToAll).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.viewFor(A).objects[bears]).toMatchObject({ cardName: "Grizzly Bears", knownToAll: true });
  });

  it("a card returned from the graveyard to hand is known", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Forest", 2);
    const dead = game.debugSpawn("Grizzly Bears", A, "graveyard");
    cast(game, toHand(game, "Regrowth"), { targets: [ref(dead)] });
    expect(game.viewFor(A).zones.hands[A]).toContain(dead);
    expect(game.viewFor(B).objects[dead]).toMatchObject({ cardName: "Grizzly Bears", knownToAll: true });
  });

  it("a card a tutor reveals as it puts it into a hand is known; one drawn is not", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Forest", 2);
    const wastes = game.debugSpawn("Wastes", A, "library");
    a.chooseFromZoneFn = () => [wastes];
    cast(game, toHand(game, "Sylvan Scrying"));
    expect(game.viewFor(A).zones.hands[A]).toContain(wastes);
    nextTurn(game);
    expect(game.viewFor(B).objects[wastes]).toMatchObject({ cardName: "Wastes", knownToAll: true });

    const drawn = game.viewFor(A).zones.hands[A].filter((id) => id !== wastes);
    expect(drawn.length).toBeGreaterThan(0);
    for (const id of drawn) {
      expect(game.viewFor(B).objects[id]).toBeUndefined();
      expect(game.viewFor(A).objects[id]?.knownToAll).toBeUndefined();
    }
  });
});
