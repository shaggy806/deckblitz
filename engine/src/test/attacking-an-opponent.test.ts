/**
 * Who an attack is aimed at, as a filter and a trigger's condition:
 * "attacks one of your opponents" (`attackingOpponent` — the player, not a
 * planeswalker or battle of theirs, rule 508.3a; whoever controls the
 * attacker), and "whenever a player attacks, if they aren't attacking you"
 * (`attack-with`'s `notAttackingYou`, an intervening if, rule 603.4).
 * Skyboon Evangelist, Soulblade Corrupter, Mirkwood Trapper.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, attack, toStep, keywords, pickPermanents, pickTargets, pt, ref, spawn, table } from "./harness.js";

function counter(game: Game, id: ObjectId): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
}

describe("Skyboon Evangelist", () => {
  it("a creature with a counter on it attacking an opponent gains flying; one without doesn't", () => {
    const { game, a } = table();
    spawn(game, "Skyboon Evangelist");
    const marked = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    counter(game, marked);
    attack(game, a, [marked, plain], B);
    expect(keywords(game, marked).has("flying")).toBe(true);
    expect(keywords(game, plain).has("flying")).toBe(false);
  });

  it("attacking a planeswalker isn't attacking the opponent", () => {
    const { game, a } = table();
    spawn(game, "Skyboon Evangelist");
    const walker = spawn(game, "Jace Beleren", B);
    const marked = spawn(game, "Grizzly Bears");
    counter(game, marked);
    attack(game, a, [marked], walker);
    expect(keywords(game, marked).has("flying")).toBe(false);
  });
});

describe("Soulblade Corrupter", () => {
  it("only a creature with a +1/+1 counter as it attacks one of your opponents gains deathtouch", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Soulblade Corrupter", C);
    const atB = spawn(game, "Grizzly Bears");
    const atC = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    counter(game, atB);
    counter(game, atC);
    a.declareAttackersFn = () => [
      { attacker: atB, defender: B },
      { attacker: atC, defender: C },
      { attacker: bare, defender: B },
    ];
    toStep(game, "postcombat-main");
    expect(keywords(game, atB).has("deathtouch")).toBe(true);
    expect(keywords(game, atC).has("deathtouch")).toBe(false);
    expect(keywords(game, bare).has("deathtouch")).toBe(false);
  });
});

describe("Mirkwood Trapper", () => {
  it("a player attacking you: its controller gives target attacking creature -2/-0, and the other ability doesn't fire", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Mirkwood Trapper", B);
    const ogre = spawn(game, "Hill Giant");
    pickTargets(b, ogre);
    const chose = pickPermanents(a, ogre);
    attack(game, a, [ogre], B);
    expect(pt(game, ogre).power).toBe(1);
    expect(chose.offered).toEqual([]);
  });

  it("a player attacking someone else: that player chooses an attacking creature, which gets +2/+0", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Mirkwood Trapper", B);
    const ogre = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const chose = pickPermanents(a, bears);
    attack(game, a, [ogre, bears], C);
    expect(chose.offered).toEqual(expect.arrayContaining([ogre, bears]));
    expect(pt(game, bears).power).toBe(4);
    expect(pt(game, ogre).power).toBe(3);
  });

  it("attacking only your planeswalker still fires it (the ruling)", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Mirkwood Trapper", B);
    const walker = spawn(game, "Jace Beleren", B);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    attack(game, a, [bears], walker);
    expect(pt(game, bears).power).toBe(4);
  });

  it("one creature at you and one elsewhere: they are attacking you, so only the first fires", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Mirkwood Trapper", B);
    const ogre = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(b, ogre);
    const chose = pickPermanents(a, bears);
    a.declareAttackersFn = () => [
      { attacker: ogre, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(pt(game, ogre).power).toBe(1);
    expect(pt(game, bears).power).toBe(2);
    expect(chose.offered).toEqual([]);
  });
});
