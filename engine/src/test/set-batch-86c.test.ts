/**
 * Set walk batch 86, part c (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
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
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  named,
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

/** Alice holds priority in bob's precombat main (turn 2). */
function toBobsMain(game: Game): void {
  game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === A);
}

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("Festival of Embers", () => {
  it("casts an instant from your graveyard during your turn for 1 life more, and exiles it after", () => {
    const { game } = table();
    // In the graveyard first: with Festival out, it would be exiled on the way.
    const bolt = toGraveyard(game, "Lightning Bolt");
    spawn(game, "Festival of Embers");
    spawn(game, "Mountain");
    cast(game, bolt, { targets: [ref(B)], via: "graveyard-permission" });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(19);
    // Resolved, it would go to your graveyard: exiled instead.
    expect(zone(game, bolt)).toBe("exile");
  });

  it("isn't a permission on an opponent's turn", () => {
    const { game } = table();
    // In the graveyard first: with Festival out, it would be exiled on the way.
    const bolt = toGraveyard(game, "Lightning Bolt");
    spawn(game, "Festival of Embers");
    spawn(game, "Mountain");
    expect(castOffers(game, bolt).length).toBeGreaterThan(0);
    toBobsMain(game);
    expect(castOffers(game, bolt)).toEqual([]);
  });

  it("exiles your cards and tokens instead of your graveyard, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Festival of Embers");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    const soldier = named(game, "Soldier Token")[0];
    destroy(game, mine);
    destroy(game, theirs);
    destroy(game, soldier);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("graveyard");
    // The token is exiled instead too (so it never dies).
    expect(game.eventsOfType("graveyard-replaced-with-exile").map((e) => e.object)).toContain(soldier);
  });

  it("sacrificed by its own ability, it is exiled (the ruling)", () => {
    const { game } = table();
    const festival = spawn(game, "Festival of Embers");
    lands(game, "Mountain", 2);
    activate(game, festival);
    expect(zone(game, festival)).toBe("exile");
  });
});

describe("High Stride", () => {
  it("gives +1/+3 and reach, and untaps the creature", () => {
    const { game } = table();
    spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "High Stride"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(isTapped(game, bears)).toBe(false);
  });
});

describe("Moonstone Harbinger", () => {
  it("a life gain on your turn pumps your Bats once, and a loss later that turn doesn't again", () => {
    const { game } = table();
    const bat = spawn(game, "Moonstone Harbinger");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(pt(game, bat)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    // Gain and lose are one ability: it has triggered this turn.
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "you" });
    settle(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(pt(game, bat)).toEqual({ power: 2, toughness: 3 });
  });

  it("a life loss on your turn triggers it too", () => {
    const { game } = table();
    const bat = spawn(game, "Moonstone Harbinger");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2, who: "you" });
    settle(game);
    expect(pt(game, bat)).toEqual({ power: 2, toughness: 3 });
  });

  it("doesn't trigger on an opponent's turn", () => {
    const { game } = table();
    const bat = spawn(game, "Moonstone Harbinger");
    toBobsMain(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(pt(game, bat)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Bonebind Orator", () => {
  it("exiles itself from your graveyard to return another creature card to your hand", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const orator = toGraveyard(game, "Bonebind Orator");
    const bears = toGraveyard(game, "Grizzly Bears");
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === orator);
    expect(offer?.kind === "activate-ability" ? offer.targetOptions?.[0]?.map((t) => (t.kind === "object" ? t.object : t.player)) : undefined).toEqual([bears]);
    activate(game, orator, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, orator)).toBe("exile");
  });
});

describe("Alania's Pathmaker", () => {
  it("exiles your top card, which you may play", () => {
    const { game } = table();
    const top = toLibrary(game, "Mountain");
    lands(game, "Mountain", 4);
    // Cast, so the trigger resolves in the main phase, where a land can be played.
    cast(game, toHand(game, "Alania's Pathmaker"));
    expect(zone(game, top)).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === top)).toBe(true);
  });
});

describe("Steampath Charger", () => {
  it("offspring makes a 1/1 copy; when it dies, it deals 1 damage to target player", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const charger = toHand(game, "Steampath Charger");
    cast(game, charger, { kicked: true });
    const chargers = named(game, "Steampath Charger");
    expect(chargers).toHaveLength(2);
    const token = chargers.find((id) => game.state.objects[id].isToken === true);
    expect(token).toBeDefined();
    expect(pt(game, token!)).toEqual({ power: 1, toughness: 1 });
    pickTargets(a, B);
    destroy(game, charger);
    expect(life(game, B)).toBe(19);
    destroy(game, token!);
    expect(life(game, B)).toBe(18);
  });

  it("unpaid, no copy", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Steampath Charger"));
    expect(named(game, "Steampath Charger")).toHaveLength(1);
  });
});

describe("Intrepid Rabbit", () => {
  it("offspring makes a 1/1 copy, and both enters triggers pump", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const rabbit = toHand(game, "Intrepid Rabbit");
    pickTargets(a, rabbit);
    cast(game, rabbit, { kicked: true });
    expect(tokensNamed(game, "Intrepid Rabbit", A)).toBe(1);
    expect(pt(game, rabbit)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Eddymurk Crab", () => {
  it("costs {1} less for each instant and sorcery card in your graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Grizzly Bears");
    const crab = toHand(game, "Eddymurk Crab");
    pickTargets(a, null, null);
    cast(game, crab);
    expect(zone(game, crab)).toBe("battlefield");
    // Cast on your own turn, it enters untapped.
    expect(isTapped(game, crab)).toBe(false);
  });

  it("flashed in on an opponent's turn, it enters tapped and taps up to two creatures", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    toBobsMain(game);
    lands(game, "Island", 7);
    const crab = toHand(game, "Eddymurk Crab");
    pickTargets(a, one, two);
    cast(game, crab);
    expect(isTapped(game, crab)).toBe(true);
    expect(isTapped(game, one)).toBe(true);
    expect(isTapped(game, two)).toBe(true);
  });
});

describe("Nocturnal Hunger", () => {
  it("unpromised, destroys the creature and you lose 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Nocturnal Hunger"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
    expect(tokensNamed(game, "Food Token", B)).toBe(0);
  });

  it("promised, the opponent gets a Food and you lose no life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Nocturnal Hunger"), { targets: [ref(bears)], kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
  });
});

describe("Scales of Shale", () => {
  it("costs {1} less for each Lizard you control, and gives +2/+0, lifelink and indestructible", () => {
    const { game } = table();
    spawn(game, "Swamp");
    spawn(game, "Steampath Charger");
    const lizard = spawn(game, "Steampath Charger");
    cast(game, toHand(game, "Scales of Shale"), { targets: [ref(lizard)] });
    expect(pt(game, lizard)).toEqual({ power: 4, toughness: 1 });
    expect(keywords(game, lizard).has("lifelink")).toBe(true);
    expect(keywords(game, lizard).has("indestructible")).toBe(true);
  });
});

describe("Hivespine Wolverine", () => {
  /** Alice picks the mode whose text starts with `start` among those offered. */
  const pickMode = (seat: Parameters<typeof pickModes>[0], start: string): void => {
    seat.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.startsWith(start))];
  };

  it("fights a creature token, and only creature tokens are offered", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 1 });
    const soldier = named(game, "Soldier Token", B)[0];
    const goblin = named(game, "Goblin Token", B)[0];
    pickMode(a, "This creature fights");
    const seen = watchTargets(a, () => [soldier]);
    const wolverine = toHand(game, "Hivespine Wolverine");
    cast(game, wolverine);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([soldier, goblin]));
    expect(seen.offered[0]).not.toContain(bears);
    expect(named(game, "Soldier Token", B)).toHaveLength(0);
    expect(game.state.objects[wolverine].damageMarked).toBe(1);
  });

  it("puts a +1/+1 counter on a creature you control", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    pickMode(a, "Put a +1/+1 counter");
    pickTargets(a, bears);
    cast(game, toHand(game, "Hivespine Wolverine"));
    expect(counters(game, bears)).toBe(1);
  });

  it("destroys an artifact or enchantment", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const ring = spawn(game, "Sol Ring", B);
    pickMode(a, "Destroy target artifact");
    pickTargets(a, ring);
    cast(game, toHand(game, "Hivespine Wolverine"));
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Cindering Cutthroat", () => {
  it("enters with a +1/+1 counter only if an opponent lost life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    // Your own life loss doesn't count.
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "you" });
    const first = toHand(game, "Cindering Cutthroat");
    cast(game, first);
    expect(counters(game, first)).toBe(0);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" });
    const second = toHand(game, "Cindering Cutthroat");
    cast(game, second);
    expect(counters(game, second)).toBe(1);
  });

  it("gains menace until end of turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const cutthroat = spawn(game, "Cindering Cutthroat");
    activate(game, cutthroat);
    expect(keywords(game, cutthroat).has("menace")).toBe(true);
  });
});

describe("Rabbit Response", () => {
  it("pumps your creatures, and scries 2 only if you control a Rabbit", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rabbit Response"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(game.eventsOfType("scried")).toHaveLength(0);
    spawn(game, "Intrepid Rabbit");
    cast(game, toHand(game, "Rabbit Response"));
    expect(game.eventsOfType("scried")).toHaveLength(1);
  });
});

describe("Valley Rally", () => {
  it("unpromised, needs no target and pumps your creatures +2/+0", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Valley Rally"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(tokensNamed(game, "Food Token", B)).toBe(0);
  });

  it("promised, the opponent gets a Food and the target gains first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Valley Rally"), { targets: [ref(bears)], kicked: true });
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, other).has("first-strike")).toBe(false);
    expect(pt(game, other)).toEqual({ power: 5, toughness: 3 });
  });

  it("promised with its target gone, nothing happens (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Valley Rally"), { targets: [ref(bears)], kicked: true, settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, "Food Token", B)).toBe(0);
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tidecaller Mentor", () => {
  it("with threshold, returns up to one nonland permanent to its owner's hand", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    spawn(game, "Swamp");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Tidecaller Mentor"));
    expect(zone(game, bears)).toBe("hand");
  });

  it("with six cards in your graveyard, it doesn't trigger", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    spawn(game, "Swamp");
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Tidecaller Mentor"));
    expect(seen.asked).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Waterspout Warden", () => {
  it("its own entering this turn isn't another creature's: no flying", () => {
    const { game, a } = table();
    const warden = enter(game, "Waterspout Warden");
    attack(game, a, [warden]);
    expect(keywords(game, warden).has("flying")).toBe(false);
  });

  it("gains flying once another creature entered under your control this turn, even one that has died", () => {
    const { game, a } = table();
    const warden = spawn(game, "Waterspout Warden");
    const bears = enter(game, "Grizzly Bears");
    destroy(game, bears);
    attack(game, a, [warden]);
    expect(keywords(game, warden).has("flying")).toBe(true);
  });

  it("an opponent's creature entering doesn't count", () => {
    const { game, a } = table();
    const warden = spawn(game, "Waterspout Warden");
    enter(game, "Grizzly Bears", B);
    attack(game, a, [warden]);
    expect(keywords(game, warden).has("flying")).toBe(false);
  });
});
