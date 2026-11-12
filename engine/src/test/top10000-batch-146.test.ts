/**
 * Batch 308, the lead's cards: the ones the batch's engine features brought
 * in, each test on the feature's clause.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { nameOf, playerCountersHeld } from "../state.js";

import { A, B, C, attack, destroy, enter, hand, life, pickModes, pickTargets, ref, settle, spawn, table, tokensNamed, zone } from "./harness.js";
import type { Table } from "./harness.js";

describe("Raphael, Tag Team Tough — combat damage to a player for the first time each turn", () => {
  it("adds one combat phase, and the second combat's damage doesn't trigger it again", () => {
    const { game, a } = table({ life: 40 });
    const raphael = spawn(game, "Raphael, Tag Team Tough");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [raphael, bears]);
    // Two combats of 5 + 2: a third (the trigger firing again) would be 21.
    expect(game.state.turn.combatPhases).toBe(2);
    expect(life(game, B)).toBe(40 - 14);
    expect(game.state.objects[raphael].tapped).toBe(true);
    expect(life(game, A)).toBe(40);
  });
});

describe("Dimension X Pizzasaur — when you do, after the counters are put", () => {
  it("offers creatures up to the counters among your permanents, and destroys the one chosen", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    const three = spawn(game, "Hill Giant", B);
    const offered: (readonly string[])[] = [];
    let call = 0;
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      call += 1;
      offered.push(legal[0].map((t) => (t.kind === "object" ? t.object : t.player)));
      return [ref(call === 1 ? mine : two)];
    };
    enter(game, "Dimension X Pizzasaur");
    // Two counters among A's permanents: Grizzly Bears (2) qualifies, Hill Giant (3) doesn't.
    expect(call).toBe(2);
    expect(offered[1]).toContain(two);
    expect(offered[1]).not.toContain(three);
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, three)).toBe("battlefield");
  });
});

describe("Lucy MacLean, Positively Armed — target player other than the token's controller", () => {
  it("offers only other players, draws for an opponent's copy, and does it once a turn", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Lucy MacLean, Positively Armed");
    const offered: (readonly string[])[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered.push(legal[0].map((t) => (t.kind === "object" ? t.object : t.player)));
      return [ref(B)];
    };
    pickModes(a, 0);
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    expect(offered[0]).not.toContain(A);
    expect(offered[0]).toEqual(expect.arrayContaining([B, C]));
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
    // Bob's copy entered too, and a third token: neither is done again this turn.
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", C)).toBe(0);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("The Ghoul, Gunslinger — if that player is you", () => {
  it("makes a Treasure when you take the rad counters, even with The Ghoul itself dead, and not for an opponent", () => {
    const { game, a } = table();
    const ghoul = spawn(game, "The Ghoul, Gunslinger");
    const corpse = spawn(game, "Walking Corpse");
    pickTargets(a, A);
    destroy(game, ghoul);
    settle(game);
    expect(playerCountersHeld(game.state, A, "rad")).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // The Ghoul is gone, so a Zombie dying now fires nothing.
    destroy(game, corpse);
    settle(game);
    expect(playerCountersHeld(game.state, A, "rad")).toBe(2);
  });

  it("gives an opponent the counters and no Treasure", () => {
    const { game, a } = table();
    spawn(game, "The Ghoul, Gunslinger");
    const corpse = spawn(game, "Walking Corpse");
    pickTargets(a, B);
    destroy(game, corpse);
    settle(game);
    expect(playerCountersHeld(game.state, B, "rad")).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Megatron — the excess redirect converts it, and the convert's \"if you do\"", () => {
  const destructiveForce = (game: Table["game"]): ObjectId => {
    const megatron = spawn(game, "Megatron, Tyrant");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(megatron)]);
    return megatron;
  };

  it("excess from the sacrificed artifact's mana value hits the controller, then Megatron converts", () => {
    const { game, a } = table();
    const megatron = destructiveForce(game);
    spawn(game, "Darksteel Ingot");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [megatron]);
    expect(zone(game, bears)).toBe("graveyard");
    // 3 damage: 2 is lethal to the Bears, 1 to Bob; converted, Megatron is the
    // 7/5 Tyrant by combat damage.
    expect(life(game, B)).toBe(20 - 1 - 7);
    expect(nameOf(game.state.objects[megatron])).toBe("Megatron, Tyrant");
  });

  it("no excess, no convert", () => {
    const { game, a } = table();
    const megatron = destructiveForce(game);
    spawn(game, "Darksteel Ingot");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    attack(game, a, [megatron]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(nameOf(game.state.objects[megatron])).toBe("Megatron, Destructive Force");
  });

  it("Tyrant converts at your postcombat main and adds {C} for each life your opponents lost", () => {
    const { game, a } = table();
    const megatron = spawn(game, "Megatron, Tyrant");
    pickModes(a, 0);
    attack(game, a, [megatron]);
    settle(game);
    expect(nameOf(game.state.objects[megatron])).toBe("Megatron, Destructive Force");
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(game.state.players[A].manaPool.filter((m) => m.type === "C").length).toBe(7);
  });
});
