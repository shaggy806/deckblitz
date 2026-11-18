/**
 * "Whenever that creature deals damage this turn, return it to its owner's
 * hand" — a delayed "whenever" watching the ability's target (`watching: 0`,
 * Paladin of Prahv's shape): any damage, combat or not, every time, for this
 * turn only; with no target chosen nothing is watched. Niko Aris's +1, and
 * the rest of Niko Aris: X Shards as it enters, the −1's 2 damage for each
 * card drawn this turn as one amount (its rulings), the Shard −1.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  keywords,
  lands,
  loyalty,
  nextTurn,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const NIKO = "Niko Aris";
const SHARD = "Shard Token";

describe("Niko Aris", () => {
  it("enters with X Shards", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 4);
    cast(game, toHand(game, NIKO), { x: 2 });
    expect(tokensNamed(game, SHARD, A)).toBe(2);
  });

  it("+1: the creature can't be blocked, and returns to its owner's hand when it deals combat damage", () => {
    const { game, a } = table();
    const niko = spawn(game, NIKO);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    loyalty(game, niko, 1, { targets: [{ kind: "object", object: bears }] });
    expect(counters(game, niko, "loyalty")).toBe(4);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    attack(game, a, [bears]);
    expect(game.state.players[B].life).toBe(18);
    expect(zone(game, bears)).toBe("hand");
  });

  it("any damage, not just combat damage (its ruling): a pinger returns when it pings", () => {
    const { game } = table();
    const niko = spawn(game, NIKO);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    loyalty(game, niko, 1, { targets: [{ kind: "object", object: sorcerer }] });
    activate(game, sorcerer, 0, { targets: [{ kind: "player", player: B }] });
    expect(game.state.players[B].life).toBe(19);
    expect(zone(game, sorcerer)).toBe("hand");
  });

  it("only this turn: next turn its damage returns nothing", () => {
    const { game } = table();
    const niko = spawn(game, NIKO);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    loyalty(game, niko, 1, { targets: [{ kind: "object", object: sorcerer }] });
    nextTurn(game);
    nextTurn(game);
    activate(game, sorcerer, 0, { targets: [{ kind: "player", player: B }] });
    expect(game.state.players[B].life).toBe(19);
    expect(zone(game, sorcerer)).toBe("battlefield");
  });

  it("+1 with no target: loyalty goes up, nothing is watched", () => {
    const { game } = table();
    const niko = spawn(game, NIKO);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    loyalty(game, niko, 1, { targets: [null] });
    expect(counters(game, niko, "loyalty")).toBe(4);
    activate(game, sorcerer, 0, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, sorcerer)).toBe("battlefield");
  });

  it("−1: 2 damage to a tapped creature for each card drawn this turn, at once (its ruling)", () => {
    const { game } = table();
    const niko = spawn(game, NIKO);
    // Alice drew her turn's card; one more makes two.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    const brontodon = spawn(game, "Ancient Brontodon", B, { tapped: true });
    loyalty(game, niko, -1, { targets: [{ kind: "object", object: brontodon }] });
    expect(game.state.objects[brontodon].damageMarked).toBe(4);
    expect(counters(game, niko, "loyalty")).toBe(2);
    // One damage event of 4, not two of 2.
    const dealt = game.eventsOfType("damage-dealt").filter((e) => e.target.kind === "object" && e.target.object === brontodon);
    expect(dealt.map((e) => e.amount)).toEqual([4]);
  });

  it("−1: an untapped creature isn't a legal target", () => {
    const { game } = table();
    const niko = spawn(game, NIKO);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => loyalty(game, niko, -1, { targets: [{ kind: "object", object: bears }] })).toThrow(/target/i);
  });

  it("the other −1 makes a Shard", () => {
    const { game } = table();
    const niko = spawn(game, NIKO);
    const index = game.registry.get(NIKO).activated.findIndex((a, i) => a.loyaltyCost === -1 && i > 1);
    activate(game, niko, index);
    expect(tokensNamed(game, SHARD, A)).toBe(1);
  });
});
