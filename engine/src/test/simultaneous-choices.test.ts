/**
 * Rule 101.4 beyond `each-player-may`: "each player discards a card" chooses in turn order from
 * the active player, each chosen card staying face down in hand (101.4a) until every player has
 * chosen, and then they're all discarded at once — Stronghold Rats', Smallpox's and Delirium
 * Skeins' rulings.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import { CHOSEN_THIS_WAY, substituteChosenThisWay } from "../effects.js";

import { A, B, C, counters, graveyard, hand, life, settle, spawn, table, toHand, zone } from "./harness.js";

const EACH_DISCARDS: EffectSpec = { kind: "discard", target: "each-player", amount: 1 };

describe("each player discards (rule 101.4)", () => {
  it("every player chooses before anyone discards, and the chosen cards stay in hand meanwhile", () => {
    const { game, a, b, c } = table({ players: 3 });
    const giant = toHand(game, "Hill Giant", A);
    toHand(game, "Grizzly Bears", A);
    const bears = toHand(game, "Grizzly Bears", B);
    toHand(game, "Hill Giant", B);
    const ogre = toHand(game, "Hill Giant", C);
    toHand(game, "Grizzly Bears", C);
    a.chooseDiscardsFn = () => [giant];
    let seenByBob: string | undefined;
    let seenByCarol: string | undefined;
    b.chooseDiscardsFn = () => {
      seenByBob = zone(game, giant);
      return [bears];
    };
    c.chooseDiscardsFn = () => {
      seenByCarol = zone(game, bears);
      return [ogre];
    };
    game.debugApplyEffect(A, EACH_DISCARDS);
    settle(game);
    expect([seenByBob, seenByCarol]).toEqual(["hand", "hand"]);
    expect([zone(game, giant), zone(game, bears), zone(game, ogre)]).toEqual(["graveyard", "graveyard", "graveyard"]);
    const discards = game.state.eventLog.filter((e) => e.type === "cards-discarded");
    expect(discards.map((e) => e.type === "cards-discarded" && e.player)).toEqual([A, B, C]);
  });

  it("a hand no bigger than the count waits for the others too", () => {
    const { game, b } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    const giant = toHand(game, "Hill Giant", A);
    const bears = toHand(game, "Grizzly Bears", B);
    toHand(game, "Hill Giant", B);
    let seenByBob: string | undefined;
    b.chooseDiscardsFn = () => {
      seenByBob = zone(game, giant);
      return [bears];
    };
    game.debugApplyEffect(A, EACH_DISCARDS);
    settle(game);
    expect(seenByBob).toBe("hand");
    expect(graveyard(game, A)).toContain(giant);
    expect(graveyard(game, B)).toContain(bears);
  });

  it("the discards are done before the next step of the same effect", () => {
    const { game, a, b } = table();
    const giant = toHand(game, "Hill Giant", A);
    toHand(game, "Grizzly Bears", A);
    const bears = toHand(game, "Grizzly Bears", B);
    toHand(game, "Hill Giant", B);
    a.chooseDiscardsFn = () => [giant];
    b.chooseDiscardsFn = () => [bears];
    const since = game.state.eventLog.length;
    game.debugApplyEffect(A, { kind: "sequence", effects: [EACH_DISCARDS, { kind: "draw", amount: 1 }] });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    const order = game.state.eventLog.slice(since).flatMap((e) => (e.type === "cards-discarded" || e.type === "card-drawn" ? [e.type] : []));
    expect(order).toEqual(["cards-discarded", "cards-discarded", "card-drawn"]);
  });
});

describe("each player chooses (rule 101.4, not a vote)", () => {
  it("Harsh Mercy's shape: each chooses a creature type; creatures of no chosen type are destroyed", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const elf = spawn(game, "Elvish Visionary", B);
    a.chooseCreatureTypeFn = () => "Bear";
    b.chooseCreatureTypeFn = () => "Elf";
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, for: { creatureType: true } },
        {
          kind: "with-choices",
          effect: { kind: "destroy-all", filter: { type: "creature", notSubtypes: [CHOSEN_THIS_WAY] }, cantBeRegenerated: true },
        },
      ],
    });
    settle(game);
    expect([zone(game, bears), zone(game, giant), zone(game, elf)]).toEqual(["battlefield", "graveyard", "battlefield"]);
  });

  it("asks from the active player, or from the next opponent, and isn't a vote", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Erestor of the Council", A);
    const asked: string[] = [];
    for (const [seat, id] of [
      [a, A],
      [b, B],
      [c, C],
    ] as const) {
      seat.chooseModesFn = () => {
        asked.push(id);
        return [0];
      };
    }
    const since = game.state.eventLog.length;
    const handBefore = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "vote", choose: true, for: { options: ["war", "peace"] } });
    settle(game);
    // Alice's turn: she chooses first, though Bob's effect asks.
    expect(asked).toEqual([A, B, C]);
    asked.length = 0;
    game.debugApplyEffect(A, { kind: "vote", choose: true, startingWith: "next-opponent", for: { options: ["war", "peace"] } });
    settle(game);
    expect(asked).toEqual([B, C, A]);
    // Erestor's "whenever players finish voting" saw no vote: it would draw.
    expect(hand(game, A)).toHaveLength(handBefore);
    const finished = game.state.eventLog.slice(since).filter((e) => e.type === "votes-finished");
    expect(finished.every((e) => e.type === "votes-finished" && e.choice === true)).toBe(true);
  });

  it("Eye of Doom's shape: each chooses a nonland permanent, and each chosen gets a doom counter", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    a.choosePermanentsFn = () => [giant];
    b.choosePermanentsFn = () => [bears];
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, for: { permanent: { notTypes: ["land"] } } },
        { kind: "for-each-voted", which: "voted", effect: { kind: "add-counter", target: 0, counter: "doom", amount: 1 } },
      ],
    });
    settle(game);
    expect(counters(game, giant, "doom")).toBe(1);
    expect(counters(game, bears, "doom")).toBe(1);
  });

  it("for-each-vote reads each player's own choice: Grave Sifter's 'cards of that type'", () => {
    const { game, a, b } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    b.chooseCreatureTypeFn = () => "Giant";
    let seen: string[] = [];
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, for: { creatureType: true } },
        { kind: "for-each-vote", effect: { kind: "gain-life", who: "that-player", amount: 1 } },
      ],
    });
    settle(game);
    seen = game.state.eventLog.flatMap((e) => (e.type === "votes-finished" ? e.votes.map((v) => ("text" in v.choice ? v.choice.text : "")) : []));
    expect(seen).toEqual(["Bear", "Giant"]);
    expect(substituteChosenThisWay({ kind: "destroy-all", filter: { subtypes: [CHOSEN_THIS_WAY] } }, ["Bear", "Elf"])).toEqual({
      kind: "destroy-all",
      filter: { subtypes: ["Bear", "Elf"] },
    });
  });
});

describe("each player may put a card from their hand onto the battlefield (rule 101.4)", () => {
  const SHOW_AND_TELL: EffectSpec = {
    kind: "each-player-may",
    who: "each-player",
    options: [{ putFromHand: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] }, text: "Put a card onto the battlefield" }],
  };

  it("every chosen card waits in hand until all have chosen, then they enter together", () => {
    const { game, a, b } = table();
    const warden = toHand(game, "Soul Warden", A);
    const bears = toHand(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    b.chooseModesFn = () => [0];
    a.chooseFromZoneFn = () => [warden];
    let wardenWhenBobChose: string | undefined;
    b.chooseFromZoneFn = () => {
      wardenWhenBobChose = zone(game, warden);
      return [bears];
    };
    game.debugApplyEffect(A, SHOW_AND_TELL);
    settle(game);
    expect(wardenWhenBobChose).toBe("hand");
    expect([zone(game, warden), zone(game, bears)]).toEqual(["battlefield", "battlefield"]);
    // Soul Warden entered with the Bears, so it saw them enter: alice gains 1.
    expect(life(game, A)).toBe(21);
  });
});
