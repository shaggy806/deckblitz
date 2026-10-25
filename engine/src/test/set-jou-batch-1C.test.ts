/**
 * The set walk: Journey into Nyx (JOU), batch 1, group C.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("King Macar, the Gold-Cursed", () => {
  it("becoming untapped may exile target creature and make a Gold token", () => {
    const { game, a } = table();
    const macar = spawn(game, "King Macar, the Gold-Cursed", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(macar)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Gold Token", A)).toBe(1);
  });

  it("declined, nothing is exiled and no Gold is made", () => {
    const { game, a } = table();
    const macar = spawn(game, "King Macar, the Gold-Cursed", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(macar)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Gold Token")).toBe(0);
  });
});

describe("Dakra Mystic", () => {
  it("you may put each revealed card into its owner's graveyard", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Dakra Mystic");
    lands(game, "Island", 1);
    const mine = toLibrary(game, "Grizzly Bears", A);
    const theirs = toLibrary(game, "Grizzly Bears", B);
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    pickModes(a, 0);
    activate(game, mystic);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(hand(game, A).length).toBe(handA);
    expect(hand(game, B).length).toBe(handB);
  });

  it("if you don't, each player draws the revealed card", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Dakra Mystic");
    lands(game, "Island", 1);
    const mine = toLibrary(game, "Grizzly Bears", A);
    const theirs = toLibrary(game, "Grizzly Bears", B);
    pickModes(a);
    activate(game, mystic);
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
  });
});

describe("Bearer of the Heavens", () => {
  it("dying destroys all permanents at the next end step, not at once", () => {
    const { game } = table();
    const bearer = spawn(game, "Bearer of the Heavens");
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Island");
    destroy(game, bearer);
    expect(zone(game, bears)).toBe("battlefield");
    const late = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, late)).toBe("graveyard");
  });
});

describe("Kruphix's Insight", () => {
  it("up to three enchantments to hand, the rest of the six to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const e1 = toLibrary(game, "Pacifism");
    const e2 = toLibrary(game, "Pacifism");
    const bears = toLibrary(game, "Grizzly Bears");
    const spell = toHand(game, "Kruphix's Insight");
    const offer = pickFromZone(a, e1, e2);
    cast(game, spell);
    expect(offer.offered).not.toContain(bears);
    expect(zone(game, e1)).toBe("hand");
    expect(zone(game, e2)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, A).length).toBe(5); // the Bears, three Wastes, the Insight
  });
});

describe("Felhide Petrifier", () => {
  it("other Minotaurs you control have deathtouch; others don't", () => {
    const { game } = table();
    spawn(game, "Felhide Petrifier");
    const minotaur = spawn(game, "Ahn-Crop Crasher");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ahn-Crop Crasher", B);
    expect(keywords(game, minotaur).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
  });
});

describe("Harvestguard Alseids", () => {
  it("entering prevents all damage to target creature this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Harvestguard Alseids");
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Riptide Chimera", () => {
  it("at upkeep returns an enchantment you control — itself when it's the only one", () => {
    const { game } = table();
    const chimera = spawn(game, "Riptide Chimera");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, chimera)).toBe("hand");
  });

  it("you choose which enchantment", () => {
    const { game, a } = table();
    const chimera = spawn(game, "Riptide Chimera");
    const other = spawn(game, "Harvestguard Alseids");
    const seen = pickPermanents(a, other);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toContain(chimera);
    expect(zone(game, other)).toBe("hand");
    expect(zone(game, chimera)).toBe("battlefield");
  });
});

describe("Flamespeaker's Will", () => {
  it("on combat damage to a player, may sacrifice it to destroy target artifact", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    const relic = spawn(game, "Sol Ring", B);
    const will = toHand(game, "Flamespeaker's Will");
    cast(game, will, { targets: [ref(bears)] });
    pickTargets(a, relic);
    pickModes(a, 0);
    attack(game, a, [bears]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(zone(game, will)).toBe("graveyard");
    expect(zone(game, relic)).toBe("graveyard");
  });
});

describe("Nessian Game Warden", () => {
  it("looks at as many cards as you control Forests", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const deep = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const seen = pickFromZone(a);
    enter(game, "Nessian Game Warden");
    expect(seen.offered).not.toContain(deep);
    expect(zone(game, deep)).toBe("library");
  });

  it("can take a creature among them", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, bears);
    enter(game, "Nessian Game Warden");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Triton Cavalry", () => {
  it("heroic may return target enchantment", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Triton Cavalry");
    const pacifism = spawn(game, "Harvestguard Alseids", B);
    lands(game, "Mountain", 1);
    const will = toHand(game, "Flamespeaker's Will");
    pickTargets(a, pacifism);
    pickModes(a, 0);
    cast(game, will, { targets: [ref(cavalry)] });
    expect(zone(game, pacifism)).toBe("hand");
  });
});

describe("Satyr Hoplite", () => {
  it("heroic puts a +1/+1 counter on it", () => {
    const { game } = table();
    const hoplite = spawn(game, "Satyr Hoplite");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Flamespeaker's Will"), { targets: [ref(hoplite)] });
    expect(counters(game, hoplite)).toBe(1);
  });
});

describe("Spiteful Blow", () => {
  it("destroys the creature and the land", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    cast(game, toHand(game, "Spiteful Blow"), { targets: [ref(bears), ref(land)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Swarmborn Giant", () => {
  it("is sacrificed when its controller is dealt combat damage", () => {
    const { game, b } = table();
    const giant = spawn(game, "Swarmborn Giant");
    toStep(game, "precombat-main", B);
    const attacker = spawn(game, "Grizzly Bears", B);
    attack(game, b, [attacker], A);
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("noncombat damage to you doesn't sacrifice it; monstrous gives reach", () => {
    const { game } = table();
    const giant = spawn(game, "Swarmborn Giant");
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(keywords(game, giant).has("reach")).toBe(false);
    lands(game, "Forest", 6);
    activate(game, giant);
    expect(counters(game, giant)).toBe(2);
    expect(keywords(game, giant).has("reach")).toBe(true);
  });
});

describe("Starfall", () => {
  it("3 to an enchantment creature and 3 to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const nymph = spawn(game, "Harvestguard Alseids", B);
    cast(game, toHand(game, "Starfall"), { targets: [ref(nymph)] });
    expect(zone(game, nymph)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("a non-enchantment creature's controller takes nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Starfall"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Rise of Eagles / Renowned Weaver", () => {
  it("Rise makes two Birds; Weaver sacrifices itself for a Spider", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Rise of Eagles"));
    expect(tokensNamed(game, "2/2 Blue Enchantment Bird Token (Flying)", A)).toBe(2);
    const weaver = spawn(game, "Renowned Weaver");
    lands(game, "Forest", 2);
    activate(game, weaver);
    expect(zone(game, weaver)).toBe("graveyard");
    expect(tokensNamed(game, "1/3 Green Enchantment Spider Token (Reach)", A)).toBe(1);
    expect(named(game, "Renowned Weaver").length).toBe(0);
  });
});
