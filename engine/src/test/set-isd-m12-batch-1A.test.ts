/**
 * Innistrad and Magic 2012 (B191), group A. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Wooden Stake", () => {
  it("destroys a Vampire that blocks the equipped creature, but not another blocker", () => {
    const { game, a, b } = table();
    const stake = spawn(game, "Wooden Stake");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, stake, 0, { targets: [ref(bears)] });
    const vampire = spawn(game, "Vampire Noble", B);
    b.declareBlockersFn = () => [{ blocker: vampire, attacker: bears }];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, vampire)).toBe("graveyard");
    // Destroyed before damage: the Bears took none and live.
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("destroys a Vampire the equipped creature blocks, and ignores a non-Vampire", () => {
    const { game, a, b } = table();
    const stake = spawn(game, "Wooden Stake");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, stake, 0, { targets: [ref(bears)] });
    const vampire = spawn(game, "Vampire Noble", B);
    a.declareBlockersFn = () => [{ blocker: bears, attacker: vampire }];
    b.declareAttackersFn = () => [{ attacker: vampire, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, vampire)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");

    const juggernaut = spawn(game, "Galvanic Juggernaut", B);
    a.declareBlockersFn = () => [{ blocker: bears, attacker: juggernaut }];
    b.declareAttackersFn = () => [{ attacker: juggernaut, defender: A }];
    toStep(game, "postcombat-main", B);
    // Not a Vampire: 3 damage doesn't kill a 5/5, and nothing destroys it.
    expect(zone(game, juggernaut)).toBe("battlefield");
  });
});

describe("Blood Ogre", () => {
  it("enters with a +1/+1 counter only if an opponent was dealt damage this turn", () => {
    const { game } = table();
    const plain = enter(game, "Blood Ogre");
    expect(counters(game, plain)).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(B)]);
    settle(game);
    const thirsty = enter(game, "Blood Ogre");
    expect(counters(game, thirsty)).toBe(1);
    expect(pt(game, thirsty)).toEqual({ power: 3, toughness: 3 });
  });

  it("doesn't count damage to yourself", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    settle(game);
    expect(counters(game, enter(game, "Blood Ogre"))).toBe(0);
  });
});

describe("Throne of Empires", () => {
  it("makes one Soldier without Crown and Scepter", () => {
    const { game } = table();
    const throne = spawn(game, "Throne of Empires");
    lands(game, "Wastes", 1);
    activate(game, throne);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });
});

describe("Gideon's Avenger", () => {
  it("grows when an opponent's creature becomes tapped, not one of yours", () => {
    const { game } = table();
    const avenger = spawn(game, "Gideon's Avenger");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, avenger)).toBe(1);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(mine)]);
    settle(game);
    expect(counters(game, avenger)).toBe(1);
  });
});

describe("Personal Sanctuary", () => {
  it("prevents damage to you during your turn only", () => {
    const { game } = table();
    spawn(game, "Personal Sanctuary");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(20);
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(17);
  });
});

describe("Wreath of Geists", () => {
  it("counts creature cards in its controller's graveyard only", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Wreath of Geists"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Galvanic Juggernaut", () => {
  it("untaps when another creature dies", () => {
    const { game } = table();
    const juggernaut = spawn(game, "Galvanic Juggernaut", A, { tapped: true });
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(game.state.objects[juggernaut].tapped).toBe(false);
  });
});

describe("Lord of the Unreal / Phantasmal Bear / Griffin Rider", () => {
  it("pumps Illusions only; the Rider needs a Griffin", () => {
    const { game } = table();
    spawn(game, "Lord of the Unreal");
    const bear = spawn(game, "Phantasmal Bear");
    const plain = spawn(game, "Grizzly Bears");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("hexproof")).toBe(true);
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 2 });

    const rider = spawn(game, "Griffin Rider");
    expect(pt(game, rider)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Griffin Sentinel");
    expect(pt(game, rider)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, rider).has("flying")).toBe(true);
  });

  it("sacrifices Phantasmal Bear when it becomes a target", () => {
    const { game } = table();
    const bear = spawn(game, "Phantasmal Bear", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });
});
