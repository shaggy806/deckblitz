/**
 * The set walk, batch 68, part b (2026-10-12): Duskmourn — the 13-or-less
 * lands, eerie, delirium, survival and three Rooms. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const playLand = (game: Game, name: string): ObjectId => {
  const land = toHand(game, name);
  game.dispatch({ type: "play-land", player: A, card: land });
  settle(game);
  return land;
};
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

/** Cast a Room's `door` (1 left, 2 right) from the hand. */
const castDoor = (game: Game, name: string, door: 1 | 2): ObjectId => {
  const room = toHand(game, name);
  game.dispatch({ type: "cast-spell", player: A, card: room, face: door, targets: [] });
  settle(game);
  return room;
};

describe("Duskmourn's 13-or-less lands (Neglected Manor and the cycle)", () => {
  it("enter tapped unless a player — you or any opponent — has 13 or less life", () => {
    const { game } = table({ players: 3 });
    expect(tapped(game, playLand(game, "Neglected Manor"))).toBe(true);
    // An opponent at 13: untapped. At 14: tapped.
    game.state.players[C].life = 13;
    expect(tapped(game, playLand(game, "Murky Sewer"))).toBe(false);
    game.state.players[C].life = 14;
    expect(tapped(game, playLand(game, "Razortrap Gorge"))).toBe(true);
    // You at 13: untapped too ("a player").
    game.state.players[A].life = 13;
    expect(tapped(game, playLand(game, "Abandoned Campground"))).toBe(false);
  });
});

describe("Balemurk Leech", () => {
  it("drains each opponent when an enchantment enters, and again when a Room is fully unlocked", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Balemurk Leech");
    enter(game, "Glorious Anthem");
    expect([life(game, B), life(game, C)]).toEqual([19, 19]);
    // Casting one door: an enchantment entering (once), not a full unlock.
    toStep(game, "precombat-main");
    lands(game, "Island", 6);
    pickTargets(a, null);
    const room = castDoor(game, "Bottomless Pool // Locker Room", 1);
    expect([life(game, B), life(game, C)]).toEqual([18, 18]);
    // Unlocking the other door: fully unlocked.
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect([life(game, B), life(game, C)]).toEqual([17, 17]);
    expect(life(game, A)).toBe(20);
  });
});

describe("Gremlin Tamer", () => {
  it("makes a 1/1 red Gremlin when an enchantment you control enters, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Gremlin Tamer");
    enter(game, "Glorious Anthem", B);
    expect(tokensNamed(game, "Gremlin Token")).toBe(0);
    enter(game, "Glorious Anthem");
    expect(tokensNamed(game, "Gremlin Token", A)).toBe(1);
    const [gremlin] = named(game, "Gremlin Token");
    // 1/1 with Alice's anthem: 2/2.
    expect(pt(game, gremlin)).toEqual({ power: 2, toughness: 2 });
    expect(game.registry.get("Gremlin Token").colors).toEqual(["R"]);
  });
});

describe("Vengeful Possession", () => {
  it("steals, untaps and hastes the creature; the loot is optional", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    toHand(game, "Lightning Bolt");
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Vengeful Possession"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(tapped(game, giant)).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    // Discarded one, drew one: the same hand size as before it was cast.
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(2);
  });
});

describe("Floodpits Drowner", () => {
  it("taps and stuns on entering, then shuffles itself and a stunned creature away — only a stunned one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const drowner = enter(game, "Floodpits Drowner");
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    lands(game, "Island", 4);
    expect(() => activate(game, drowner, 0, { targets: [ref(giant)] })).toThrow();
    activate(game, drowner, 0, { targets: [ref(bears)] });
    expect(zone(game, drowner)).toBe("library");
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toContain(bears);
    expect(game.state.zones.perPlayer[A].library).toContain(drowner);
  });
});

describe("Irreverent Gremlin", () => {
  it("loots once a turn for a small creature entering — a declined offer doesn't use it up", () => {
    const { game, a } = table();
    spawn(game, "Irreverent Gremlin");
    let asked = 0;
    let answer: number[] = [];
    a.chooseModesFn = () => {
      asked += 1;
      return answer;
    };
    // Power 3: no trigger.
    enter(game, "Hill Giant");
    expect(asked).toBe(0);
    enter(game, "Grizzly Bears");
    expect(asked).toBe(1);
    expect(graveyard(game)).toHaveLength(0);
    answer = [0];
    enter(game, "Grizzly Bears");
    expect(asked).toBe(2);
    expect(graveyard(game)).toHaveLength(1);
    // Done once this turn: not offered again.
    enter(game, "Grizzly Bears");
    expect(asked).toBe(2);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Cynical Loner", () => {
  it("survival: tapped at your second main phase, you may put any card from your library into your graveyard", () => {
    const { game, a } = table();
    spawn(game, "Cynical Loner", A, { tapped: true });
    const bolt = toLibrary(game, "Lightning Bolt");
    pickModes(a, 0);
    pickFromZone(a, bolt);
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("untapped, nothing; and Glimmers can't block it", () => {
    const { game, a } = table();
    const loner = spawn(game, "Cynical Loner");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    toStep(game, "postcombat-main");
    settle(game);
    expect(asked).toBe(0);

    toStep(game, "precombat-main");
    const glimmer = spawn(game, "Glimmer Token", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [loner]);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(glimmer)).not.toContain(loner);
    expect(canBlock(bears)).toContain(loner);
  });
});

describe("Trapped in the Screen", () => {
  it("exiles an opponent's artifact, creature or enchantment (not a land) until it leaves", () => {
    const { game, a } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    const land = spawn(game, "Forest", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [anthem]);
    const screen = enter(game, "Trapped in the Screen");
    expect(seen.offered[0]).toContain(anthem);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(land);
    expect(zone(game, anthem)).toBe("exile");
    destroy(game, screen);
    expect(named(game, "Glorious Anthem", B)).toHaveLength(1);
  });
});

describe("Derelict Attic // Widow's Walk", () => {
  it("Derelict Attic: you draw two and lose 2 as it's unlocked", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    castDoor(game, "Derelict Attic // Widow's Walk", 1);
    // The door left the hand; two cards came in.
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });

  it("Widow's Walk: a creature attacking alone gets +1/+0 and deathtouch; two attackers, nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    castDoor(game, "Derelict Attic // Widow's Walk", 2);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(life(game, B)).toBe(17);

    const { game: game2, a: a2 } = table();
    lands(game2, "Swamp", 4);
    castDoor(game2, "Derelict Attic // Widow's Walk", 2);
    const pair = [spawn(game2, "Grizzly Bears"), spawn(game2, "Grizzly Bears")];
    attack(game2, a2, pair);
    expect(pair.map((id) => pt(game2, id).power)).toEqual([2, 2]);
    expect(keywords(game2, pair[0]).has("deathtouch")).toBe(false);
  });
});

describe("Meat Locker // Drowned Diner", () => {
  it("Meat Locker taps up to one creature with two stun counters; Drowned Diner draws three, discards one", () => {
    const { game, a } = table();
    lands(game, "Island", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const room = castDoor(game, "Meat Locker // Drowned Diner", 1);
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(2);
    const before = hand(game).length;
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Surgical Suite // Hospital Room", () => {
  it("Surgical Suite returns a creature card of mana value 3 or less from your graveyard to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const goblin = toGraveyard(game, "Raging Goblin");
    const seen = watchTargets(a, () => [bears]);
    castDoor(game, "Surgical Suite // Hospital Room", 1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(goblin);
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Hospital Room: whenever you attack, a +1/+1 counter on target attacking creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    castDoor(game, "Surgical Suite // Hospital Room", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(life(game, B)).toBe(17);
  });
});

describe("Clockwork Percussionist", () => {
  it("dies: exiles your top card, playable through your next turn", () => {
    const { game } = table();
    const monkey = spawn(game, "Clockwork Percussionist");
    const top = toLibrary(game, "Lightning Bolt");
    destroy(game, monkey);
    expect(zone(game, top)).toBe("exile");
    // Still playable on your next turn.
    toStep(game, "precombat-main");
    lands(game, "Mountain", 1);
    cast(game, top, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });
});
