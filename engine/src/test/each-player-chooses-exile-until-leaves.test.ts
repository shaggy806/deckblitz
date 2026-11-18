/**
 * "Each player chooses two nontoken, non-Vehicle creatures they control. Exile them until this
 * Vehicle leaves the battlefield" (Foreboding Steamboat): a `vote` with `choose` (rule 101.4 —
 * the active player first, each knowing the choices before theirs), then one `exile-all` of
 * what was chosen, until the source leaves (rule 610.3). Its attack trigger puts one of those
 * cards into its owner's graveyard — a card it exiled until it leaves is still linked to it
 * (rule 607.2a) — and investigates only if it did.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  destroy,
  enter,
  graveyard,
  pickFromZone,
  pickPermanents,
  settle,
  spawn,
  table,
  tokensNamed,
  zone,
} from "./harness.js";

const STEAMBOAT = "Foreboding Steamboat";

const crew = (game: Game, vehicle: ObjectId, ...creatures: ObjectId[]): void => {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap: creatures };
  game.dispatch(action);
  settle(game);
};

const ready = (game: Game, name: string, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  return id;
};

describe("Foreboding Steamboat", () => {
  it("each player's two chosen creatures are exiled together, and return when it leaves", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const lions = spawn(game, "Savannah Lions", A);
    const ogre = spawn(game, "Gray Ogre", B);
    const elves = spawn(game, "Llanowar Elves", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    const order: string[] = [];
    const askedA = pickPermanents(a, giant, bears);
    const askedB = pickPermanents(b, ogre, elves);
    const fnA = a.choosePermanentsFn!;
    const fnB = b.choosePermanentsFn!;
    a.choosePermanentsFn = (...args) => {
      order.push("alice");
      return fnA(...args);
    };
    b.choosePermanentsFn = (...args) => {
      order.push("bob");
      // Alice has chosen, but nothing is exiled until everyone has.
      expect(zone(game, giant)).toBe("battlefield");
      return fnB(...args);
    };
    const boat = enter(game, STEAMBOAT, A);
    expect(order).toEqual(["alice", "bob"]);
    // Each from their own nontoken creatures; the Vehicle itself isn't one.
    expect([...askedA.offered].sort()).toEqual([giant, bears, lions].sort());
    expect([...askedB.offered].sort()).toEqual([ogre, elves].sort());
    for (const id of [giant, bears, ogre, elves]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, lions)).toBe("battlefield");

    destroy(game, boat);
    settle(game);
    for (const id of [giant, bears, ogre, elves]) expect(zone(game, id)).toBe("battlefield");
  });

  it("a player with one creature exiles it; one with none isn't asked", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    let bobAsked = false;
    pickPermanents(a, bears);
    b.choosePermanentsFn = () => {
      bobAsked = true;
      return [];
    };
    enter(game, STEAMBOAT, A);
    expect(zone(game, bears)).toBe("exile");
    expect(bobAsked).toBe(false);
  });

  it("gone before its enters ability resolves, it exiles nothing (rule 610.3a)", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const ogre = spawn(game, "Gray Ogre", B);
    pickPermanents(a, bears);
    pickPermanents(b, ogre);
    const boat = enter(game, STEAMBOAT, A, { settle: false });
    game.debugMove(boat, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("attacking, it puts one exiled card into its owner's graveyard and investigates", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const ogre = spawn(game, "Gray Ogre", B);
    const elves = spawn(game, "Llanowar Elves", B);
    pickPermanents(a, bears, giant);
    pickPermanents(b, ogre, elves);
    const boat = enter(game, STEAMBOAT, A);
    game.state.objects[boat].summoningSick = false;
    const crewA = ready(game, "Hill Giant");
    crew(game, boat, crewA);
    const offered = pickFromZone(a, ogre);
    attack(game, a, [boat]);
    expect([...offered.offered].sort()).toEqual([bears, giant, ogre, elves].sort());
    expect(zone(game, ogre)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(ogre);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    // The rest stay exiled until it leaves; the one in the graveyard stays there.
    destroy(game, boat);
    settle(game);
    expect(zone(game, ogre)).toBe("graveyard");
    for (const id of [bears, giant, elves]) expect(zone(game, id)).toBe("battlefield");
  });

  it("with nothing exiled with it, attacking puts nothing in a graveyard and doesn't investigate", () => {
    const { game, a } = table();
    const boat = enter(game, STEAMBOAT, A);
    game.state.objects[boat].summoningSick = false;
    const crewA = ready(game, "Hill Giant");
    crew(game, boat, crewA);
    attack(game, a, [boat]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});
