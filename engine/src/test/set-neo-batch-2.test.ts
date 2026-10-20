/**
 * Kamigawa: Neon Dynasty — the reconfigure Equipment creatures (rule 702.151,
 * `reconfigure.test.ts`): each one's "this creature or equipped creature" ability works from
 * whichever is the creature.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  counters,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Acquisition Octopus", () => {
  it("draws when it or the creature it equips deals combat damage to a player", () => {
    const { game, a } = table();
    const octopus = spawn(game, "Acquisition Octopus");
    let before = hand(game).length;
    attack(game, a, [octopus]);
    expect(hand(game).length).toBe(before + 1);

    const { game: g2, a: a2 } = table();
    const octo2 = spawn(g2, "Acquisition Octopus");
    const bears = spawn(g2, "Grizzly Bears");
    lands(g2, "Island", 2);
    activate(g2, octo2, 0, { targets: [ref(bears)] });
    before = hand(g2).length;
    attack(g2, a2, [bears]);
    expect(hand(g2).length).toBe(before + 1);
  });
});

describe("Chainflail Centipede", () => {
  it("the creature that attacks gets +2/+0", () => {
    const { game, a } = table();
    const centipede = spawn(game, "Chainflail Centipede");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    activate(game, centipede, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(pt(game, bears).power).toBe(4);
    expect(life(game, B)).toBe(16);
  });
});

describe("Simian Sling", () => {
  it("a blocked equipped creature deals 1 damage to the defending player", () => {
    const { game, a, b } = table();
    const sling = spawn(game, "Simian Sling");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    activate(game, sling, 0, { targets: [ref(bears)] });
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
    // The damage came from the equipped creature, not the Sling.
    const dealt = game.state.eventLog.filter((e) => e.type === "damage-dealt" && e.target.kind === "player");
    expect(dealt.at(-1)).toMatchObject({ source: bears });
  });
});

describe("Ogre-Head Helm", () => {
  it("you may sacrifice the equipped creature (not the Helm) to discard your hand and draw three", () => {
    const { game, a } = table();
    const helm = spawn(game, "Ogre-Head Helm");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    activate(game, helm, 0, { targets: [ref(bears)] });
    toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, helm)).toBe("battlefield");
    expect(hand(game).length).toBe(3);
  });
});

describe("Armguard Familiar, Leech Gauntlet and Webspinner Cuff", () => {
  it("grant +2/+1 and ward {2}; lifelink; +1/+4 and reach", () => {
    const { game } = table();
    const familiar = spawn(game, "Armguard Familiar");
    const gauntlet = spawn(game, "Leech Gauntlet");
    const cuff = spawn(game, "Webspinner Cuff");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    const z = spawn(game, "Grizzly Bears");
    lands(game, "Island", 12);
    activate(game, familiar, 0, { targets: [ref(x)] });
    activate(game, gauntlet, 0, { targets: [ref(y)] });
    activate(game, cuff, 0, { targets: [ref(z)] });
    expect(pt(game, x)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, y).has("lifelink")).toBe(true);
    expect(pt(game, z)).toEqual({ power: 3, toughness: 6 });
    expect(keywords(game, z).has("reach")).toBe(true);
  });
});

// Older reconfigure cards (B8–B36) the feature unblocked.

describe("Komainu Battle Armor", () => {
  it("goads each creature the damaged player controls", () => {
    const { game, a } = table();
    const armor = spawn(game, "Komainu Battle Armor");
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    attack(game, a, [armor]);
    for (const id of [x, y]) expect(game.state.objects[id].goadedBy).toContain(A);
  });
});

describe("Tanuki Transplanter", () => {
  it("adds {G} equal to the attacker's power, kept through the turn", () => {
    const { game, a } = table();
    const tanuki = spawn(game, "Tanuki Transplanter");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    activate(game, tanuki, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "G").length).toBe(2);
  });
});

describe("Lion Sash", () => {
  it("exiles a graveyard card, growing only for a permanent card, and pumps the creature it equips", () => {
    const { game } = table();
    const sash = spawn(game, "Lion Sash");
    const bears = spawn(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    lands(game, "Plains", 4);
    activate(game, sash, 0, { targets: [ref(bolt)] });
    expect(counters(game, sash)).toBe(0);
    activate(game, sash, 0, { targets: [ref(giant)] });
    expect(counters(game, sash)).toBe(1);
    activate(game, sash, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Rabbit Battery and Lizard Blades", () => {
  it("grant haste and +1/+1; double strike", () => {
    const { game } = table();
    const rabbit = spawn(game, "Rabbit Battery");
    const blades = spawn(game, "Lizard Blades");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    activate(game, rabbit, 0, { targets: [ref(x)] });
    activate(game, blades, 0, { targets: [ref(y)] });
    expect(keywords(game, x).has("haste")).toBe(true);
    expect(pt(game, x)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, y).has("double-strike")).toBe(true);
  });
});
