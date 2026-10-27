/**
 * Invasion (INV; B232), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Pouncing Kavu", () => {
  it("kicked, enters with two +1/+1 counters and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const card = toHand(game, "Pouncing Kavu");
    cast(game, card, { kicked: true });
    expect(zone(game, card)).toBe("battlefield");
    expect(counters(game, card)).toBe(2);
    expect(keywords(game, card).has("haste")).toBe(true);
    expect(keywords(game, card).has("first-strike")).toBe(true);
  });

  it("unkicked, no counters and no haste", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const card = toHand(game, "Pouncing Kavu");
    cast(game, card);
    expect(counters(game, card)).toBe(0);
    expect(keywords(game, card).has("haste")).toBe(false);
  });
});

describe("Benalish Lancer", () => {
  it("kicked, enters with two +1/+1 counters and first strike; unkicked, neither", () => {
    const { game } = table();
    lands(game, "Plains", 9);
    const kicked = toHand(game, "Benalish Lancer");
    cast(game, kicked, { kicked: true });
    expect(counters(game, kicked)).toBe(2);
    expect(keywords(game, kicked).has("first-strike")).toBe(true);
    const plain = toHand(game, "Benalish Lancer");
    cast(game, plain);
    expect(counters(game, plain)).toBe(0);
    expect(keywords(game, plain).has("first-strike")).toBe(false);
  });
});

describe("Phyrexian Reaper", () => {
  it("destroys a green blocker before damage", () => {
    const { game, a, b } = table();
    const reaper = spawn(game, "Phyrexian Reaper");
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: reaper }];
    attack(game, a, [reaper]);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, reaper)).toBe("battlefield");
  });

  it("leaves a non-green blocker alone", () => {
    const { game, a, b } = table();
    const reaper = spawn(game, "Phyrexian Reaper");
    const elemental = spawn(game, "Air Elemental", B);
    b.declareBlockersFn = () => [{ blocker: elemental, attacker: reaper }];
    attack(game, a, [reaper]);
    expect(zone(game, elemental)).toBe("battlefield");
    expect(zone(game, reaper)).toBe("graveyard");
  });
});

describe("Smoldering Tar", () => {
  it("drains a target player at upkeep and sacrifices for 4 damage to a creature", () => {
    const { game, a } = table();
    const tar = spawn(game, "Smoldering Tar");
    pickTargets(a, B);
    toStep(game, "upkeep");
    toStep(game, "precombat-main");
    expect(life(game, B)).toBe(19);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, tar, 0, { targets: [ref(giant)] });
    expect(zone(game, tar)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Firebrand Ranger", () => {
  it("puts a basic land from hand onto the battlefield", () => {
    const { game, a } = table();
    const ranger = spawn(game, "Firebrand Ranger");
    lands(game, "Forest", 1);
    const plains = toHand(game, "Plains");
    const seen = pickFromZone(a, plains);
    activate(game, ranger, 0);
    expect(seen.offered).toContain(plains);
    expect(zone(game, plains)).toBe("battlefield");
  });
});

describe("Horned Cheetah", () => {
  it("gains life equal to the damage it deals", () => {
    const { game, a } = table();
    const cheetah = spawn(game, "Horned Cheetah");
    attack(game, a, [cheetah]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Cinder Shade", () => {
  it("sacrifices to deal damage equal to its pumped power", () => {
    const { game } = table();
    const shade = spawn(game, "Cinder Shade");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    activate(game, shade, 0);
    activate(game, shade, 0);
    expect(pt(game, shade).power).toBe(3);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, shade, 1, { targets: [ref(giant)] });
    expect(graveyard(game, A)).toContain(shade);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Hate Weaver", () => {
  it("pumps only a blue or red creature", () => {
    const { game } = table();
    const weaver = spawn(game, "Hate Weaver");
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: weaver, abilityIndex: 0, targets: [ref(bears)] }),
    ).not.toBeNull();
    activate(game, weaver, 0, { targets: [ref(giant)] });
    expect(pt(game, giant).power).toBe(4);
  });
});
