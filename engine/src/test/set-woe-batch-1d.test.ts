/**
 * Wilds of Eldraine (WOE/WOC), batch 1, part d (2026-10-17). Written on the
 * shared table in `harness.ts`, each from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
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
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Answer every choose-from-zone with whichever of `ids` are eligible. */
function pickEach(seat: ReturnType<typeof table>["a"], ...ids: readonly ObjectId[]): void {
  seat.chooseFromZoneFn = (_view, eligible) => ids.filter((id) => eligible.includes(id));
}

describe("Heartflame Duelist // Heartflame Slash", () => {
  it("gives instant and sorcery spells you control lifelink — its own Adventure included", () => {
    const { game } = table();
    spawn(game, "Heartflame Duelist");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(23);
    const card = toHand(game, "Heartflame Duelist");
    cast(game, card, { face: 1, targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    expect(life(game)).toBe(26);
    expect(zone(game, card)).toBe("exile");
  });

  it("doesn't give an opponent's spells lifelink", () => {
    const { game } = table();
    spawn(game, "Heartflame Duelist");
    lands(game, "Mountain", 1, B);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(life(game)).toBe(17);
    expect(life(game, B)).toBe(20);
  });
});

describe("Galvanic Giant // Storm Reading", () => {
  it("taps and stuns an opponent's creature when you cast a spell with mana value 5 or greater", () => {
    const { game, a } = table();
    spawn(game, "Galvanic Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 10);
    pickTargets(a, bears);
    cast(game, toHand(game, "Divination"));
    expect(game.state.objects[bears].tapped).toBe(false);
    const card = toHand(game, "Galvanic Giant");
    cast(game, card, { face: 1 });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Tempest Hart // Scan the Clouds", () => {
  it("grows when you cast a spell whose X makes its mana value 5", () => {
    const { game } = table();
    const hart = spawn(game, "Tempest Hart");
    lands(game, "Wastes", 9);
    cast(game, toHand(game, "Endless One"), { x: 4 });
    expect(counters(game, hart)).toBe(0);
    cast(game, toHand(game, "Endless One"), { x: 5 });
    expect(counters(game, hart)).toBe(1);
  });
});

describe("Elvish Archivist", () => {
  it("gets two counters once for artifacts entering together, and only once each turn", () => {
    const { game } = table();
    const elf = spawn(game, "Elvish Archivist");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 2 });
    settle(game);
    expect(counters(game, elf)).toBe(2);
    enter(game, "Ornithopter");
    expect(counters(game, elf)).toBe(2);
  });

  it("draws once for an enchantment, and only once each turn", () => {
    const { game } = table();
    spawn(game, "Elvish Archivist");
    const before = hand(game).length;
    enter(game, "Glorious Anthem");
    expect(hand(game).length).toBe(before + 1);
    enter(game, "Glorious Anthem");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Neva, Stalked by Nightmares", () => {
  it("returns a creature or enchantment card, and grows and scries when an enchantment you control dies", () => {
    const { game, a } = table();
    const anthem = toGraveyard(game, "Glorious Anthem");
    toGraveyard(game, "Lightning Bolt");
    pickTargets(a, anthem);
    const neva = enter(game, "Neva, Stalked by Nightmares");
    expect(zone(game, anthem)).toBe("hand");
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    destroy(game, theirs);
    expect(counters(game, neva)).toBe(0);
    destroy(game, mine);
    expect(counters(game, neva)).toBe(1);
    expect(scried).toBe(1);
  });
});

describe("Water Wings", () => {
  it("makes your creature a 4/4 base with flying and hexproof until end of turn, counters on top", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Water Wings"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    toStep(game, "upkeep", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Spider Food", () => {
  it("makes a Food with no target chosen", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Spider Food"), { targets: [null] });
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Food Coma", () => {
  it("exiles an opponent's creature until it leaves, and makes a Food", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const coma = enter(game, "Food Coma");
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    destroy(game, coma);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Feed the Cauldron", () => {
  it("makes a Food only on your turn", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const first = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Feed the Cauldron"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    const second = spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep", B);
    game.state.priority.holder = A;
    cast(game, toHand(game, "Feed the Cauldron"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Ego Drain", () => {
  it("takes a nonland card, then exiles a card from your hand unless you control a Faerie", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bears = toHand(game, "Grizzly Bears", B);
    toHand(game, "Island", B);
    const bolt = toHand(game, "Lightning Bolt");
    pickEach(a, bears, bolt);
    cast(game, toHand(game, "Ego Drain"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("exile");
  });

  it("keeps your hand while you control a Faerie", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    spawn(game, "Faerie Rogue Token");
    const bears = toHand(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    pickEach(a, bears, bolt);
    cast(game, toHand(game, "Ego Drain"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Food Fight", () => {
  it("lets an artifact be sacrificed for 1 plus the number of Food Fights you control", () => {
    const { game } = table();
    spawn(game, "Food Fight");
    lands(game, "Wastes", 4);
    const thopter = spawn(game, "Ornithopter");
    activate(game, thopter, 0, { targets: [ref(B)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    spawn(game, "Food Fight");
    const memnite = spawn(game, "Memnite");
    activate(game, memnite, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });

  it("doesn't give an opponent's artifacts the ability", () => {
    const { game } = table();
    spawn(game, "Food Fight");
    const theirs = spawn(game, "Ornithopter", B);
    const mine = spawn(game, "Ornithopter");
    lands(game, "Wastes", 2);
    lands(game, "Wastes", 2, B);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === mine)).toBe(true);
    game.state.priority.holder = B;
    expect(game.legalActions(B).some((o) => o.kind === "activate-ability" && o.source === theirs)).toBe(false);
  });
});

describe("Tattered Ratter", () => {
  it("gives a Rat you control +2/+0 when it becomes blocked, not another creature", () => {
    const { game, a, b } = table();
    spawn(game, "Tattered Ratter");
    const rat = spawn(game, "Rat Token (Can't Block)");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Grizzly Bears", B);
    const wall2 = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [
      { attacker: rat, defender: B },
      { attacker: bears, defender: B },
    ];
    b.declareBlockersFn = () => [
      { blocker: wall, attacker: rat },
      { blocker: wall2, attacker: bears },
    ];
    game.advanceUntil(
      (s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.priority.holder === A,
    );
    expect(pt(game, rat)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Specter of Mortality", () => {
  it("exiles any number of creature cards; when it does, each other creature gets -X/-X", () => {
    const { game, a } = table();
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Lightning Bolt");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickFromZone(a, one, two);
    const specter = enter(game, "Specter of Mortality");
    expect(seen.offered).toEqual(expect.arrayContaining([one, two]));
    expect(seen.offered).toHaveLength(2);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, specter)).toEqual({ power: 3, toughness: 3 });
  });

  it("does nothing more when nothing is exiled", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    pickFromZone(a);
    enter(game, "Specter of Mortality");
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Redtooth Vanguard", () => {
  it("may be paid {2} back to hand from the graveyard when an enchantment you control enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const vanguard = toGraveyard(game, "Redtooth Vanguard");
    enter(game, "Glorious Anthem", B);
    expect(zone(game, vanguard)).toBe("graveyard");
    pickModes(a, 0);
    enter(game, "Glorious Anthem");
    expect(zone(game, vanguard)).toBe("hand");
  });
});
