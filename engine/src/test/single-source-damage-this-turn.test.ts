/**
 * The damage one source dealt this turn, read from the journal's damage
 * entries (the `damage-dealt-this-turn` condition's `oneSource` and
 * `bySelf`): Dragon Cultist's "if a source you controlled dealt 5 or more
 * damage this turn" — the most any one source dealt, all of it, however it
 * was dealt (its ruling) — and Chandra, Fire of Kaladesh's "if Chandra has
 * dealt 3 or more damage this turn", combat damage included (her ruling),
 * in the stint she's in (rule 400.7).
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  lands,
  life,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const DRAGON = "Dragon Token (Dragonback Assault)";

/** Alice's commander with Dragon Cultist out. */
const cultist = (game: Game): ObjectId => {
  spawn(game, "Dragon Cultist");
  const commander = spawn(game, "Hill Giant");
  game.state.objects[commander].isCommander = true;
  return commander;
};

/** Cast `name` at `target`, the lands for it already out. */
const burn = (game: Game, name: string, target: ObjectId | PlayerId): ObjectId => {
  const spell = toHand(game, name);
  cast(game, spell, { targets: [ref(target)] });
  return spell;
};

/** Prodigal Pyromancer pings `target`, untapped again after. */
const ping = (game: Game, pyromancer: ObjectId, target: ObjectId | PlayerId): void => {
  activate(game, pyromancer, 0, { targets: [ref(target)] });
  game.state.objects[pyromancer].tapped = false;
};

describe("Dragon Cultist: if a source you controlled dealt 5 or more damage this turn", () => {
  it("one spell that dealt 5 makes a Dragon at your end step", () => {
    const { game } = table();
    cultist(game);
    lands(game, "Mountain", 5);
    burn(game, "Lava Axe", B);
    expect(life(game, B)).toBe(15);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(1);
  });

  it("6 from two sources is no one source's 5", () => {
    const { game } = table();
    cultist(game);
    lands(game, "Mountain", 2);
    burn(game, "Lightning Bolt", B);
    burn(game, "Lightning Bolt", B);
    expect(life(game, B)).toBe(14);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, DRAGON)).toBe(0);
  });

  it("one source's damage adds up over the turn, to different things", () => {
    const { game } = table();
    cultist(game);
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    const giant = spawn(game, "Hill Giant", B);
    for (let i = 0; i < 3; i += 1) ping(game, pyromancer, B);
    ping(game, pyromancer, giant);
    toStep(game, "end");
    settle(game);
    // 4 isn't 5.
    expect(tokensNamed(game, DRAGON)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    for (let i = 0; i < 3; i += 1) ping(game, pyromancer, B);
    ping(game, pyromancer, giant);
    ping(game, pyromancer, giant);
    expect(zone(game, giant)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(1);
  });

  it("counts a source you controlled as it dealt the damage, not one an opponent did", () => {
    const { game } = table();
    cultist(game);
    // An opponent's source: not yours as it dealt it.
    const theirs = spawn(game, "Prodigal Pyromancer", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(A)], { source: theirs });
    settle(game);
    expect(life(game, A)).toBe(15);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, DRAGON)).toBe(0);
  });

  it("a source you controlled as it dealt the damage still counts once it's theirs", () => {
    const { game } = table();
    cultist(game);
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    for (let i = 0; i < 5; i += 1) ping(game, pyromancer, B);
    game.state.objects[pyromancer].controller = B;
    invalidateComputedCache();
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(1);
  });

  it("a token stack's combat damage dealt as one is each token's share", () => {
    const { game, a } = table({ life: 1000 });
    cultist(game);
    // Past the combat wake-up cap: the stack attacks as one counted object,
    // its 300 tokens' damage one event from 300 sources.
    const stack = spawn(game, "Scute Swarm");
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 300;
    attack(game, a, [stack]);
    expect(life(game, B)).toBe(700);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, DRAGON)).toBe(0);
  });
});

describe("Chandra, Fire of Kaladesh: if Chandra has dealt 3 or more damage this turn", () => {
  it("one ping isn't 3: she stays as she is", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Fire of Kaladesh");
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[chandra].face ?? 0).toBe(0);
  });

  it("her combat damage counts, a red spell untaps her, and the spell's damage isn't hers", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Fire of Kaladesh");
    attack(game, a, [chandra]);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[chandra].tapped).toBe(true);
    lands(game, "Mountain", 1);
    burn(game, "Shock", B);
    expect(game.state.objects[chandra].tapped).toBe(false);
    expect(life(game, B)).toBe(16);
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(zone(game, chandra)).toBe("battlefield");
    expect(game.state.objects[chandra].face).toBe(1);
    expect(counters(game, chandra, "loyalty")).toBe(4);
  });

  it("transforms on the third ping, not before", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Fire of Kaladesh");
    activate(game, chandra, 0, { targets: [ref(B)] });
    game.state.objects[chandra].tapped = false;
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(game.state.objects[chandra].face ?? 0).toBe(0);
    game.state.objects[chandra].tapped = false;
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(game.state.objects[chandra].face).toBe(1);
  });

  it("what she dealt before she left the battlefield was another object's (rule 400.7)", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Fire of Kaladesh");
    activate(game, chandra, 0, { targets: [ref(B)] });
    game.state.objects[chandra].tapped = false;
    activate(game, chandra, 0, { targets: [ref(B)] });
    lands(game, "Plains", 1);
    const flicker = toHand(game, "Cloudshift");
    cast(game, flicker, { targets: [ref(chandra)] });
    expect(zone(game, chandra)).toBe("battlefield");
    game.state.objects[chandra].summoningSick = false;
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[chandra].face ?? 0).toBe(0);
  });
});

/** Chandra, pinged over into Chandra, Roaring Flame at `target` (3 damage). */
const roaring = (game: Game, target: PlayerId = B): ObjectId => {
  const chandra = spawn(game, "Chandra, Fire of Kaladesh");
  for (let i = 0; i < 3; i += 1) {
    game.state.objects[chandra].tapped = false;
    activate(game, chandra, 0, { targets: [ref(target)] });
  }
  expect(game.state.objects[chandra].face).toBe(1);
  return chandra;
};

describe("Chandra, Roaring Flame", () => {
  it("−7: 6 damage to each opponent, and each player dealt damage gets an emblem that burns them at their upkeep", () => {
    const { game } = table({ players: 3 });
    const chandra = roaring(game, C);
    // A planeswalker that enters this way can use a loyalty ability at once
    // (the back face's abilities, by index: +1, −2, −7).
    game.state.objects[chandra].counters.loyalty = 7;
    activate(game, chandra, 2);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(14);
    expect(life(game, C)).toBe(11);
    const emblems = (player: PlayerId): number => game.state.emblems.filter((e) => e.owner === player).length;
    expect([emblems(A), emblems(B), emblems(C)]).toEqual([0, 1, 1]);
    nextTurn(game);
    expect(life(game, B)).toBe(11);
    expect(life(game, C)).toBe(11);
    nextTurn(game);
    expect(life(game, C)).toBe(8);
    expect(life(game, A)).toBe(20);
  });

  it("+1 and −2 deal 2", () => {
    const { game } = table();
    const chandra = roaring(game);
    expect(counters(game, chandra, "loyalty")).toBe(4);
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(counters(game, chandra, "loyalty")).toBe(5);
    nextTurn(game);
    nextTurn(game);
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, chandra, 1, { targets: [ref(bear)] });
    expect(counters(game, chandra, "loyalty")).toBe(3);
    expect(zone(game, bear)).toBe("graveyard");
  });
});
