/**
 * Set walk batch 86, part d (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** A Soldier token for `player` (a real token, not a spawned card). */
function soldierToken(game: Game, player = A): ObjectId {
  const before = new Set(named(game, "Soldier Token", player));
  game.debugApplyEffect(player, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
  const made = named(game, "Soldier Token", player).find((id) => !before.has(id));
  if (made === undefined) throw new Error("no Soldier token made");
  return made;
}

describe("Mind Spiral", () => {
  it("unpromised: target player draws three, and nothing is tapped", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Mind Spiral"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 3);
    expect(isTapped(game, bears)).toBe(false);
    expect(tokensNamed(game, "Fish Token", B)).toBe(0);
  });

  it("promised: the opponent gets a tapped Fish, you draw three, and their creature is tapped with a stun counter", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const spiral = toHand(game, "Mind Spiral");
    const before = hand(game, A).length;
    cast(game, spiral, { targets: [ref(A), ref(bears)], kicked: true });
    expect(hand(game, A).length).toBe(before - 1 + 3);
    const fish = named(game, "Fish Token", B);
    expect(fish.length).toBe(1);
    expect(isTapped(game, fish[0])).toBe(true);
    // Already tapped, it still gets the counter (the ruling).
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Wax-Wane Witness", () => {
  it("gets +1/+0 for each life gain and each life loss during your turn, not during an opponent's", () => {
    const { game } = table();
    const witness = spawn(game, "Wax-Wane Witness");
    expect(keywords(game, witness).has("flying")).toBe(true);
    expect(keywords(game, witness).has("vigilance")).toBe(true);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(pt(game, witness)).toEqual({ power: 3, toughness: 4 });
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2 }, []);
    settle(game);
    expect(pt(game, witness)).toEqual({ power: 4, toughness: 4 });
    // Someone else's life changing doesn't count.
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(pt(game, witness)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(pt(game, witness)).toEqual({ power: 2, toughness: 4 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1 }, []);
    settle(game);
    expect(pt(game, witness)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Hazardroot Herbalist", () => {
  it("whenever you attack, a token you target gets +1/+0 and deathtouch", () => {
    const { game, a } = table();
    spawn(game, "Hazardroot Herbalist");
    const bears = spawn(game, "Grizzly Bears");
    const token = soldierToken(game);
    pickTargets(a, token);
    attack(game, a, [bears]);
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, token).has("deathtouch")).toBe(true);
  });

  it("a nontoken creature gets only the +1/+0", () => {
    const { game, a } = table();
    spawn(game, "Hazardroot Herbalist");
    const bears = spawn(game, "Grizzly Bears");
    soldierToken(game);
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("Rust-Shield Rampager", () => {
  it("offspring paid, it makes a 1/1 token copy", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Rust-Shield Rampager"), { kicked: true });
    const all = named(game, "Rust-Shield Rampager", A);
    expect(all.length).toBe(2);
    const token = all.find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    expect(pt(game, token as ObjectId)).toEqual({ power: 1, toughness: 1 });
  });

  it("can't be blocked by creatures with power 2 or less", () => {
    const { game, a } = table();
    const rampager = spawn(game, "Rust-Shield Rampager");
    const ogre = spawn(game, "Gray Ogre", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [rampager]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(ogre)).not.toContain(rampager);
    expect(canBlock(giant)).toContain(rampager);
  });
});

describe("Plumecreed Mentor", () => {
  it("it entering, and another flier you control entering, each put a counter on a creature you control without flying", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Gray Ogre");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Plumecreed Mentor"));
    // Only your own creatures without flying: not the Mentor, not bob's.
    expect([...seen.offered[0]].sort()).toEqual([bears, ogre].sort());
    expect(counters(game, bears)).toBe(1);
    enter(game, "Wind Drake");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(0);
    // A creature without flying entering doesn't trigger it.
    const asked = seen.asked;
    enter(game, "Grizzly Bears");
    expect(seen.asked).toBe(asked);
    // An opponent's flier entering doesn't either.
    enter(game, "Wind Drake", B);
    expect(seen.asked).toBe(asked);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Mabel's Mettle", () => {
  it("gives +2/+2 to one target and +1/+1 to up to one other", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Gray Ogre");
    cast(game, toHand(game, "Mabel's Mettle"), { targets: [ref(bears), ref(ogre)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, ogre)).toEqual({ power: 3, toughness: 3 });
    // The second slot may be left empty.
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Mabel's Mettle"), { targets: [ref(ogre), null] });
    expect(pt(game, ogre)).toEqual({ power: 5, toughness: 5 });
  });

  it("the second target must be another creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Mabel's Mettle"), { targets: [ref(bears), ref(bears)] })).toThrow();
  });
});

describe("Frilled Sparkshooter", () => {
  it("enters with a +1/+1 counter only if an opponent lost life this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const first = toHand(game, "Frilled Sparkshooter");
    cast(game, first);
    expect(counters(game, first)).toBe(0);
    expect(keywords(game, first).has("reach")).toBe(true);
    expect(keywords(game, first).has("menace")).toBe(true);
    // Gaining more than they lost still counts as having lost life (the ruling).
    game.debugApplyEffect(B, { kind: "lose-life", amount: 1 }, []);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 2 }, []);
    const second = toHand(game, "Frilled Sparkshooter");
    cast(game, second);
    expect(counters(game, second)).toBe(1);
    expect(pt(game, second)).toEqual({ power: 4, toughness: 4 });
  });

  it("your own life loss doesn't count", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3 }, []);
    const shooter = toHand(game, "Frilled Sparkshooter");
    cast(game, shooter);
    expect(counters(game, shooter)).toBe(0);
  });
});

describe("Reptilian Recruiter", () => {
  it("steals a creature with power 2 or less until end of turn, untapped and hasty", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    cast(game, toHand(game, "Reptilian Recruiter"));
    expect(controller(game, bears)).toBe(A);
    expect(isTapped(game, bears)).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("a bigger creature only while you control another Lizard", () => {
    const { game, a } = table();
    lands(game, "Mountain", 10);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Reptilian Recruiter"));
    expect(controller(game, giant)).toBe(B);
    // With another Lizard (this second Recruiter's view: the first one).
    pickTargets(a, giant);
    cast(game, toHand(game, "Reptilian Recruiter"));
    expect(controller(game, giant)).toBe(A);
    expect(keywords(game, giant).has("haste")).toBe(true);
  });
});

describe("Druid of the Spade", () => {
  it("gets +2/+0 and trample while you control a token", () => {
    const { game } = table();
    const druid = spawn(game, "Druid of the Spade");
    soldierToken(game, B);
    expect(pt(game, druid)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, druid).has("trample")).toBe(false);
    soldierToken(game);
    expect(pt(game, druid)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, druid).has("trample")).toBe(true);
  });
});

describe("Sonar Strike", () => {
  it("deals 4 damage to a tapped creature; you gain 3 life only with a Bat", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Sonar Strike"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    spawn(game, "Bartizan Bats");
    const other = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Sonar Strike"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("can't target an untapped creature that isn't in combat", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Sonar Strike"), { targets: [ref(giant)] })).toThrow();
  });
});

describe("Seasoned Warrenguard", () => {
  it("attacking while you control a token, it gets +2/+0", () => {
    const { game, a } = table();
    const guard = spawn(game, "Seasoned Warrenguard");
    soldierToken(game);
    attack(game, a, [guard]);
    expect(pt(game, guard)).toEqual({ power: 3, toughness: 2 });
    expect(life(game, B)).toBe(17);
  });

  it("without a token, it doesn't", () => {
    const { game, a } = table();
    const guard = spawn(game, "Seasoned Warrenguard");
    attack(game, a, [guard]);
    expect(pt(game, guard)).toEqual({ power: 1, toughness: 2 });
    expect(life(game, B)).toBe(19);
  });
});

describe("Take Out the Trash", () => {
  it("deals 3 damage; with a Raccoon you may rummage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Raccoon Rallier");
    const giant = spawn(game, "Hill Giant", B);
    const start = hand(game, A).length;
    const trash = toHand(game, "Take Out the Trash");
    pickModes(a, 0);
    cast(game, trash, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game, A).length).toBe(start);
    expect(graveyard(game, A).length).toBe(2);
  });

  it("without a Raccoon there's no rummage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const start = hand(game, A).length;
    pickModes(a, 0);
    cast(game, toHand(game, "Take Out the Trash"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game, A).length).toBe(start);
    expect(graveyard(game, A).length).toBe(1);
  });
});

describe("Nightwhorl Hermit", () => {
  it("with threshold it gets +1/+0 and can't be blocked", () => {
    const { game } = table();
    const hermit = spawn(game, "Nightwhorl Hermit");
    expect(pt(game, hermit)).toEqual({ power: 1, toughness: 4 });
    expect(keywords(game, hermit).has("unblockable")).toBe(false);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    expect(pt(game, hermit)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, hermit).has("unblockable")).toBe(true);
    expect(keywords(game, hermit).has("vigilance")).toBe(true);
  });
});

describe("Blooming Blast", () => {
  it("unpromised: 2 damage to the creature only", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Blooming Blast"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });

  it("promised: they get a Treasure, and the creature's controller takes 3", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Blooming Blast"), { targets: [ref(bears)], kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
  });
});

describe("Mind Drill Assailant", () => {
  it("gets +3/+0 with threshold, and surveils 1 for {2}{U/B}", () => {
    const { game, a } = table();
    const drill = spawn(game, "Mind Drill Assailant");
    expect(pt(game, drill)).toEqual({ power: 2, toughness: 5 });
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    expect(pt(game, drill)).toEqual({ power: 5, toughness: 5 });
    lands(game, "Swamp", 3);
    const top = toLibrary(game, "Lightning Bolt");
    let looked: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      looked = cards;
      return [...cards];
    };
    activate(game, drill);
    expect(looked).toEqual([top]);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Conduct Electricity", () => {
  it("deals 6 to a creature and 2 to up to one creature token", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    const token = soldierToken(game, B);
    cast(game, toHand(game, "Conduct Electricity"), { targets: [ref(giant), ref(token)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(named(game, "Soldier Token", B).length).toBe(0);
  });

  it("the second target must be a token, but may be the first target (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 10);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() =>
      cast(game, toHand(game, "Conduct Electricity"), { targets: [ref(giant), ref(bears)] }),
    ).toThrow();
    const token = soldierToken(game, B);
    cast(game, toHand(game, "Conduct Electricity"), { targets: [ref(token), ref(token)] });
    expect(named(game, "Soldier Token", B).length).toBe(0);
  });
});
