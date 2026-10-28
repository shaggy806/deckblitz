/**
 * "Can block an additional creature" and "can block any number of creatures"
 * (rule 509.1a lets a creature block one attacker) — the `blockAdditional`
 * static and the `block-additional` effect. The offer says how many each
 * blocker may take (`maxBlocks`); the declaration names it once per attacker;
 * it divides its combat damage among them (510.1d); "whenever ~ blocks"
 * triggers once (509.3a).
 */
import { describe, expect, it } from "vitest";

import { A, B, blockOffer, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const sick = (game: Game, ...ids: ObjectId[]): void => {
  for (const id of ids) game.state.objects[id].summoningSick = false;
};

const why = (game: Game, blocks: readonly { blocker: ObjectId; attacker: ObjectId }[]): string | null =>
  game.canDispatch({ type: "declare-blockers", player: B, blocks });

describe("a creature that can block an additional creature", () => {
  it("is offered two blocks and may block two attackers", () => {
    const { game, a } = table();
    const giant = spawn(game, "Two-Headed Giant of Foriys", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const cubs = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", A);
    sick(game, bears, cubs, elves);
    const offer = blockOffer(game, a, [bears, cubs, elves]);
    expect(offer.eligible.find((e) => e.blocker === giant)?.maxBlocks).toBe(2);
    expect(
      why(game, [
        { blocker: giant, attacker: bears },
        { blocker: giant, attacker: cubs },
        { blocker: giant, attacker: elves },
      ]),
    ).toMatch(/can't block more than 2/);
    expect(why(game, [{ blocker: giant, attacker: bears }, { blocker: giant, attacker: bears }])).toMatch(/already blocking/);
    game.dispatch({
      type: "declare-blockers",
      player: B,
      blocks: [
        { blocker: giant, attacker: bears },
        { blocker: giant, attacker: cubs },
      ],
    });
    expect(game.state.objects[bears].blocked).toBe(true);
    expect(game.state.objects[cubs].blocked).toBe(true);
  });

  it("divides its combat damage among the attackers it blocks (510.1d)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Two-Headed Giant of Foriys", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const cubs = spawn(game, "Grizzly Bears", A);
    sick(game, bears, cubs);
    blockOffer(game, a, [bears, cubs]);
    game.dispatch({
      type: "declare-blockers",
      player: B,
      blocks: [
        { blocker: giant, attacker: bears },
        { blocker: giant, attacker: cubs },
      ],
    });
    game.advanceUntil((s) => s.awaiting?.kind === "assign-combat-damage" && s.awaiting.player === B);
    game.dispatch({ type: "assign-combat-damage", player: B, assignment: [2, 2] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, cubs)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard"); // 4 damage from the two
  });

  it("one without the ability blocks only one", () => {
    const { game, a } = table();
    const wall = spawn(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const cubs = spawn(game, "Grizzly Bears", A);
    sick(game, bears, cubs);
    const offer = blockOffer(game, a, [bears, cubs]);
    expect(offer.eligible.find((e) => e.blocker === wall)?.maxBlocks).toBeUndefined();
    expect(why(game, [{ blocker: wall, attacker: bears }, { blocker: wall, attacker: cubs }])).toMatch(/already blocking/);
  });

  it("Palace Guard blocks any number, and loses that with its abilities", () => {
    const { game, a } = table();
    const guard = spawn(game, "Palace Guard", B);
    const attackers = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A), spawn(game, "Llanowar Elves", A)];
    sick(game, ...attackers);
    const offer = blockOffer(game, a, attackers);
    expect(offer.eligible.find((e) => e.blocker === guard)?.maxBlocks).toBe(3);
    expect(why(game, attackers.map((attacker) => ({ blocker: guard, attacker })))).toBeNull();
  });

  it("Palace Guard under Humility blocks one", () => {
    const { game, a } = table();
    const guard = spawn(game, "Palace Guard", B);
    spawn(game, "Humility", B);
    const attackers = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A)];
    sick(game, ...attackers);
    const offer = blockOffer(game, a, attackers);
    expect(offer.eligible.find((e) => e.blocker === guard)?.maxBlocks).toBeUndefined();
  });

  it("Brave the Sands gives each of its controller's creatures one more", () => {
    const { game, a } = table();
    spawn(game, "Brave the Sands", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const attackers = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A)];
    sick(game, ...attackers);
    const offer = blockOffer(game, a, attackers);
    expect(offer.eligible.find((e) => e.blocker === bears)?.maxBlocks).toBe(2);
  });

  it("Act of Heroism: one more block this turn, from the effect", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2, B);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Act of Heroism", B), { player: B, targets: [ref(bears)] });
    const attackers = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A)];
    sick(game, ...attackers);
    const offer = blockOffer(game, a, attackers);
    expect(offer.eligible.find((e) => e.blocker === bears)?.maxBlocks).toBe(2);
    expect(life(game, B)).toBe(20);
  });
});
