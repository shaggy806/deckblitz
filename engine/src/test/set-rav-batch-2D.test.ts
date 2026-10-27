/**
 * Ravnica: City of Guilds (RAV) — group D of the second set walk: Helldozer's
 * nonbasic untap, Light of Sanction's source filter, Surge of Zeal's radiance,
 * Drake Familiar's return-or-sacrifice, Flash Conscription's white rider,
 * Ribbons of Night's blue rider, Blockbuster's tapped creatures, Woodwraith
 * Strangler's graveyard regeneration and Transluminant's delayed Spirit.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickPermanents,
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

describe("Helldozer", () => {
  it("untaps after destroying a nonbasic land, but not a basic one", () => {
    const { game } = table();
    const dozer = spawn(game, "Helldozer");
    lands(game, "Swamp", 6);
    const nonbasic = spawn(game, "Command Tower", B);
    const basic = spawn(game, "Forest", B);
    activate(game, dozer, 0, { targets: [ref(nonbasic)] });
    expect(zone(game, nonbasic)).toBe("graveyard");
    expect(game.state.objects[dozer].tapped).toBe(false);
    activate(game, dozer, 0, { targets: [ref(basic)] });
    expect(zone(game, basic)).toBe("graveyard");
    expect(game.state.objects[dozer].tapped).toBe(true);
  });
});

describe("Light of Sanction", () => {
  it("prevents damage your own sources deal to your creatures, not to an opponent's", () => {
    const { game } = table();
    spawn(game, "Light of Sanction");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked).toBe(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("doesn't prevent an opponent's source's damage to your creatures", () => {
    const { game } = table();
    spawn(game, "Light of Sanction");
    const mine = spawn(game, "Grizzly Bears");
    const bobBears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, B);
    nextTurn(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, bobBears)).toBe("battlefield");
  });
});

describe("Surge of Zeal", () => {
  it("gives haste to the target and each creature sharing a color with it, not the others", () => {
    const { game } = table();
    const target = spawn(game, "Raging Goblin", A, { sick: true });
    const sharer = spawn(game, "Goblin Piker", B, { sick: true });
    const green = spawn(game, "Grizzly Bears", A, { sick: true });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Surge of Zeal"), { targets: [ref(target)] });
    expect(keywords(game, target).has("haste")).toBe(true);
    expect(keywords(game, sharer).has("haste")).toBe(true);
    expect(keywords(game, green).has("haste")).toBe(false);
  });
});

describe("Drake Familiar", () => {
  it("returns an opponent's enchantment to its owner's hand and stays", () => {
    const { game, a } = table();
    const pacifism = spawn(game, "Light of Sanction", B);
    pickPermanents(a, pacifism);
    const drake = enter(game, "Drake Familiar");
    expect(zone(game, pacifism)).toBe("hand");
    expect(hand(game, B)).toContain(pacifism);
    expect(zone(game, drake)).toBe("battlefield");
  });

  it("is sacrificed with no enchantment to return", () => {
    const { game } = table();
    const drake = enter(game, "Drake Familiar");
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Flash Conscription", () => {
  it("with {W} spent, the stolen creature's combat damage gains its controller that much life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Flash Conscription"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].controller).toBe(A);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("without {W} spent, no life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Flash Conscription"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Ribbons of Night", () => {
  it("draws a card only when {U} was spent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    lands(game, "Island", 1);
    const ribbons = toHand(game, "Ribbons of Night");
    const before = hand(game, A).length;
    cast(game, ribbons, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
    // The Ribbons left the hand, a card was drawn.
    expect(hand(game, A).length).toBe(before);
  });

  it("draws nothing paid with black alone", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    const ribbons = toHand(game, "Ribbons of Night");
    const before = hand(game, A).length;
    cast(game, ribbons, { targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before - 1);
  });
});

describe("Blockbuster", () => {
  it("deals 3 to each tapped creature and each player, sparing untapped creatures", () => {
    const { game } = table();
    const bb = spawn(game, "Blockbuster");
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    activate(game, bb);
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(graveyard(game, A)).toContain(bb);
  });
});

describe("Woodwraith Strangler", () => {
  it("regenerates by exiling a creature card from your graveyard", () => {
    const { game } = table();
    const strangler = spawn(game, "Woodwraith Strangler");
    const fodder = toGraveyard(game, "Grizzly Bears");
    activate(game, strangler);
    expect(zone(game, fodder)).toBe("exile");
    destroy(game, strangler);
    settle(game);
    expect(zone(game, strangler)).toBe("battlefield");
  });
});

describe("Transluminant", () => {
  it("makes the Spirit at the beginning of the next end step, not at once", () => {
    const { game } = table();
    const dryad = spawn(game, "Transluminant");
    lands(game, "Plains", 1);
    activate(game, dryad);
    expect(zone(game, dryad)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});
