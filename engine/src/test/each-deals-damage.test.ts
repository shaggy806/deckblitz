/**
 * `each-deals-damage`: each permanent matching a filter deals damage — its
 * power, or a fixed amount — to itself, a target, the trigger's object or
 * each player of a scope, each permanent a source of its own (rule 120.1),
 * who deals what read once (608.2h) and all of it dealt at once. Proved on
 * Solar Blaze and Wave of Reckoning (itself), Moonlight Hunt, Bartz and Boko
 * and Signature Slam (a target), and Alpha Brawl (that player's other
 * creatures, back at the target).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, enter, graveyard, hand, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

function stackOf(game: Game, name: string, player: PlayerId, count: number): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: name, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].isToken,
  );
  if (stack === undefined || (game.state.objects[stack].stackCount ?? 1) !== count) {
    throw new Error(`expected one stack of ${count} ${name}`);
  }
  return stack;
}

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
/** Life-gain events for `player` since event `since`. */
const gains = (game: Game, player: PlayerId, since: number): number =>
  game.events
    .slice(since)
    .filter((e) => e.type === "life-changed" && e.player === player && e.delta > 0).length;

describe("each creature deals damage to itself", () => {
  it("Solar Blaze: each creature is dealt damage equal to its power, by itself", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", A); // 3/3
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    const crow = spawn(game, "Storm Crow", B); // 1/2
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Solar Blaze"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, crow)).toBe("battlefield");
    expect(damage(game, crow)).toBe(1);
  });

  it("Wave of Reckoning: a lifelinker's damage to itself gains its controller life, each its own gain", () => {
    const { game } = table();
    spawn(game, "Vampire Nighthawk", A); // 2/3 deathtouch lifelink
    spawn(game, "Vampire Nighthawk", A);
    const viper = spawn(game, "Ambush Viper", B); // 2/1 deathtouch
    lands(game, "Plains", 1);
    lands(game, "Wastes", 4);
    const before = game.events.length;
    cast(game, toHand(game, "Wave of Reckoning"));
    // Each Nighthawk has deathtouch: its own 2 damage destroys it.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Vampire Nighthawk")).toEqual([]);
    expect(zone(game, viper)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
    // Two lifelink sources dealing damage at once: two life-gain events (702.15e).
    expect(gains(game, A, before)).toBe(2);
  });

  it("a token stack: each token deals its damage to itself", () => {
    const { game } = table();
    stackOf(game, "Wolf Token", B, 9); // 2/2s
    lands(game, "Plains", 1);
    lands(game, "Wastes", 4);
    cast(game, toHand(game, "Wave of Reckoning"));
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Wolf Token")).toBe(false);
    expect(graveyard(game, B).length).toBe(0); // tokens cease to exist
  });

  it("a token stack dealing damage to a player is that many sources", () => {
    const { game } = table();
    stackOf(game, "Wolf Token", A, 9);
    game.debugApplyEffect(A, {
      kind: "each-deals-damage",
      filter: { type: "creature", controlledBy: "you" },
      amount: "its-power",
      to: { who: "each-opponent" },
    });
    expect(life(game, B)).toBe(20 - 18);
  });

  it("only what matches: a filter on the dealers (each tapped creature)", () => {
    const { game } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, {
      kind: "each-deals-damage",
      filter: { type: "creature", tapped: true },
      amount: "its-power",
      to: "itself",
    });
    expect(damage(game, tapped)).toBe(2);
    expect(damage(game, untapped)).toBe(0);
  });
});

describe("each creature deals damage to a target", () => {
  it("Moonlight Hunt: only your Wolves and Werewolves deal damage, each its power", () => {
    const { game } = table();
    spawn(game, "Kessig Wolf", A); // 3/1 Wolf
    spawn(game, "Wolf Token", A); // 2/2 Wolf
    spawn(game, "Craw Wurm", A); // not a Wolf
    spawn(game, "Kessig Wolf", B); // a Wolf, but not yours
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Moonlight Hunt"), { targets: [ref(wurm)] });
    // 3 + 2: lethal for its 4 toughness.
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("damage from several sources at once is one event for the creature dealt it (enrage once)", () => {
    const { game } = table();
    spawn(game, "Wolf Token", A);
    spawn(game, "Wolf Token", A);
    const raptor = spawn(game, "Ripjaw Raptor", B); // 4/5, enrage: draw a card
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    const cards = hand(game, B).length;
    cast(game, toHand(game, "Moonlight Hunt"), { targets: [ref(raptor)] });
    expect(damage(game, raptor)).toBe(4);
    expect(hand(game, B).length).toBe(cards + 1);
  });

  it("Moonlight Hunt: a target gone illegal is dealt nothing", () => {
    const { game } = table();
    spawn(game, "Kessig Wolf", A);
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Moonlight Hunt"), { targets: [ref(wurm)], settle: false });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(wurm)]);
    const back = game.state.zones.perPlayer[B].hand.find((id) => game.state.objects[id].cardName === "Craw Wurm");
    expect(back).toBeDefined();
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Moonlight Hunt")).toBe(true);
  });

  it("Bartz and Boko: each other Bird you control deals its power, Bartz and Boko itself none", () => {
    const { game, a } = table();
    spawn(game, "Storm Crow", A); // 1/2 Bird
    spawn(game, "Suntail Hawk", A); // 1/1 Bird
    const raptor = spawn(game, "Ripjaw Raptor", B);
    a.chooseTargetsFn = () => [ref(raptor)];
    enter(game, "Bartz and Boko", A);
    expect(damage(game, raptor)).toBe(2);
  });

  it("Signature Slam: the counter lands first, so that creature is modified and deals damage too", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A); // 2/2, becomes 3/3
    spawn(game, "Gray Ogre", A); // 2/2, unmodified: deals nothing
    const raptor = spawn(game, "Ripjaw Raptor", B);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Signature Slam"), { targets: [ref(bears), ref(raptor)] });
    expect(damage(game, raptor)).toBe(3);
  });

  it("each opponent, and a fixed amount, come through the same effect", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Hill Giant", A);
    spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, {
      kind: "each-deals-damage",
      filter: { type: "creature", controlledBy: "you" },
      amount: "its-power",
      to: { who: "each-opponent" },
    });
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(15);
    expect(life(game, A)).toBe(20);
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(A, {
      kind: "each-deals-damage",
      filter: { type: "creature", controlledBy: "you" },
      amount: 1,
      to: 0,
    }, [ref(wurm)]);
    expect(damage(game, wurm)).toBe(2);
  });
});

describe("Alpha Brawl", () => {
  it("the target deals its power to each other creature that player controls, then each of those deals its power back", () => {
    const { game } = table();
    const ogre = spawn(game, "Gray Ogre", B); // 2/2
    const giant = spawn(game, "Hill Giant", B); // 3/3
    const wurm = spawn(game, "Craw Wurm", B); // 6/4, the target
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Alpha Brawl"), { targets: [ref(wurm)] });
    // The ogre and giant were dealt lethal damage first, and still dealt
    // 2 + 3 back before state-based actions: all three die.
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(damage(game, mine)).toBe(0);
  });
});
