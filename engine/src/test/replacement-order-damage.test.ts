/**
 * Szadek, Lord of Secrets and Phantom Centaur: a damage replacement beside a
 * prevention effect on the same damage, ordered by the player or the
 * permanent's controller it's dealt to (rule 616.1 — `Game.damageOrderAsked`).
 */

import { describe, expect, it } from "vitest";

import type { ReplacementOrderOffer, ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, attack, cast, counters, graveyard, lands, life, ref, spawn, table, toHand } from "./harness.js";

function answering(seat: ScriptedController, pick: (o: ReplacementOrderOffer["options"][number]) => boolean): ReplacementOrderOffer[] {
  const asked: ReplacementOrderOffer[] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer);
    return Math.max(0, offer.options.findIndex(pick));
  };
  return asked;
}

/** Alice's Heal: the next 1 damage to `target` is prevented. */
const heal = (game: Game, target: PlayerId | ObjectId): void => {
  lands(game, "Plains", 1);
  cast(game, toHand(game, "Heal"), { targets: [ref(target)] });
};

describe("Szadek, Lord of Secrets", () => {
  it("combat damage to a player becomes counters and a mill of that many", () => {
    const { game, a } = table();
    const szadek = spawn(game, "Szadek, Lord of Secrets", A, { sick: false });
    const milled = graveyard(game, B).length;
    attack(game, a, [szadek]);
    expect(life(game, B)).toBe(20);
    expect(counters(game, szadek)).toBe(5);
    expect(graveyard(game, B).length - milled).toBe(5);
  });

  it("the player dealt the damage may apply a prevention shield first", () => {
    const { game, a, b } = table();
    const szadek = spawn(game, "Szadek, Lord of Secrets", A, { sick: false });
    heal(game, B);
    const milled = graveyard(game, B).length;
    const asked = answering(b, (o) => o.name === "Heal");
    attack(game, a, [szadek]);
    expect(asked).toHaveLength(1);
    expect(life(game, B)).toBe(20);
    expect(counters(game, szadek)).toBe(4);
    expect(graveyard(game, B).length - milled).toBe(4);
  });

  it("or let Szadek's replacement apply, keeping the shield", () => {
    const { game, a, b } = table();
    const szadek = spawn(game, "Szadek, Lord of Secrets", A, { sick: false });
    heal(game, B);
    answering(b, (o) => o.name.startsWith("Szadek"));
    attack(game, a, [szadek]);
    expect(counters(game, szadek)).toBe(5);
    // The shield is still there for the next damage.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Phantom Centaur", () => {
  it("enters with three counters; damage is prevented and a counter goes", () => {
    const { game } = table();
    const centaur = spawn(game, "Phantom Centaur", B);
    expect(counters(game, centaur)).toBe(3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(centaur)] });
    expect(game.state.objects[centaur].damageMarked).toBe(0);
    expect(counters(game, centaur)).toBe(2);
  });

  it("damage from a black source: protection first costs no counter, its controller's choice", () => {
    const { game, a, b } = table();
    const centaur = spawn(game, "Phantom Centaur", B);
    const gravedigger = spawn(game, "Gravedigger", A, { sick: false });
    // Left alone (the best order for them), protection goes first.
    b.declareBlockersFn = () => [{ blocker: centaur, attacker: gravedigger }];
    attack(game, a, [gravedigger]);
    expect(game.state.objects[centaur].damageMarked).toBe(0);
    expect(counters(game, centaur)).toBe(3);
  });

  it("its controller may apply its own prevention first and lose a counter", () => {
    const { game, a, b } = table();
    const centaur = spawn(game, "Phantom Centaur", B);
    const gravedigger = spawn(game, "Gravedigger", A, { sick: false });
    const asked = answering(b, (o) => o.name === "Phantom Centaur" && !o.text.toLowerCase().includes("protection"));
    b.declareBlockersFn = () => [{ blocker: centaur, attacker: gravedigger }];
    attack(game, a, [gravedigger]);
    expect(asked).toHaveLength(1);
    expect(game.state.objects[centaur].damageMarked).toBe(0);
    expect(counters(game, centaur)).toBe(2);
  });
});
