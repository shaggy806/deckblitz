/**
 * "If a creature would enter the battlefield under an opponent's control this
 * turn, it enters under your control instead" (Gather Specimens): a resolved
 * `others-enter-battlefield` `underYou` replacement (rule 614.1a), read by
 * `Game.enteringUnder` for a spell resolving, an effect putting a card there
 * and a token being created, first of the replacements on how it enters (its
 * ruling), each once (rule 614.5).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, controller, counters, lands, named, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const gather = (game: Game, player = A): void => {
  lands(game, "Island", 6, player);
  cast(game, toHand(game, "Gather Specimens", player), { player });
};

const reanimate = (game: Game, player: typeof A, card: ObjectId): void => {
  game.debugApplyEffect(player, { kind: "put-onto-battlefield", target: 0 }, [ref(card)]);
};

describe("a creature enters under your control instead (Gather Specimens)", () => {
  it("an opponent's creature spell resolves under your control, and stays yours", () => {
    const { game } = table();
    gather(game);
    lands(game, "Forest", 2, B);
    const viper = toHand(game, "Ambush Viper", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, viper, { player: B });
    expect(zone(game, viper)).toBe("battlefield");
    expect(controller(game, viper)).toBe(A);
    expect(game.state.objects[viper].owner).toBe(B);
    // A control effect keeps it there past this turn (rule 110.2).
    nextTurn(game);
    expect(controller(game, viper)).toBe(A);
  });

  it("a creature an opponent puts onto the battlefield is yours; a noncreature isn't", () => {
    const { game } = table();
    gather(game);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    reanimate(game, B, bears);
    expect(controller(game, bears)).toBe(A);
    const splitter = toGraveyard(game, "Bonesplitter", B);
    reanimate(game, B, splitter);
    expect(controller(game, splitter)).toBe(B);
  });

  it("an opponent's creature tokens enter under your control, still theirs to own; a Treasure doesn't", () => {
    const { game } = table();
    gather(game);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 2 });
    const soldiers = named(game, "Soldier Token");
    expect(soldiers.length).toBeGreaterThan(0);
    const total = soldiers.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(total).toBe(2);
    for (const id of soldiers) {
      expect(controller(game, id)).toBe(A);
      expect(game.state.objects[id].owner).toBe(B);
    }
    game.debugApplyEffect(B, { kind: "create-token", token: "Treasure Token", count: 1 });
    for (const id of named(game, "Treasure Token")) expect(controller(game, id)).toBe(B);
    nextTurn(game);
    for (const id of named(game, "Soldier Token")) expect(controller(game, id)).toBe(A);
  });

  it("an opponent reanimating your creature card under their control: it comes back yours, and stays", () => {
    const { game } = table();
    gather(game);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    // "…onto the battlefield under your control" for bob, who doesn't own it
    // (rule 110.2a): the control effect he'd get never starts.
    game.debugApplyEffect(B, { kind: "put-onto-battlefield", target: 0, underYourControl: true }, [ref(mine)]);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
    expect(game.state.objects[mine].controlEffects ?? []).toEqual([]);
    nextTurn(game);
    expect(controller(game, mine)).toBe(A);
  });

  it("your own creatures and what an opponent puts under your control are unchanged", () => {
    const { game } = table();
    gather(game);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    reanimate(game, A, mine);
    expect(controller(game, mine)).toBe(A);
  });

  it("you make its as-enters choices: a devour eats your creatures, not theirs", () => {
    const { game, a, b } = table();
    // There before it resolves: bob's Bears stay his.
    const myBears = spawn(game, "Grizzly Bears");
    const theirBears = spawn(game, "Grizzly Bears", B);
    gather(game);
    let offered: readonly string[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return [myBears];
    };
    b.choosePermanentsFn = () => [theirBears];
    const myco = toGraveyard(game, "Mycoloth", B);
    reanimate(game, B, myco);
    // Asked as it's about to enter (rule 614.12a): of alice.
    expect(game.state.awaiting?.player).toBe(A);
    settle(game);
    expect(controller(game, myco)).toBe(A);
    expect(offered).toContain(myBears);
    expect(offered).not.toContain(theirBears);
    expect(zone(game, myBears)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(counters(game, myco)).toBe(2);
  });

  it("two opposing Gather Specimens: each applies once, so it enters where it would have", () => {
    const { game } = table();
    gather(game, A);
    lands(game, "Island", 6, B);
    const theirs = toHand(game, "Gather Specimens", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, theirs, { player: B });
    const bears = toGraveyard(game, "Grizzly Bears", B);
    reanimate(game, B, bears);
    expect(controller(game, bears)).toBe(B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    reanimate(game, A, mine);
    expect(controller(game, mine)).toBe(A);
  });

  it("ends with the turn, and doesn't take back what entered before it", () => {
    const { game } = table();
    const before = spawn(game, "Grizzly Bears", B);
    gather(game);
    expect(controller(game, before)).toBe(B);
    nextTurn(game);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    reanimate(game, B, bears);
    expect(controller(game, bears)).toBe(B);
  });
});
