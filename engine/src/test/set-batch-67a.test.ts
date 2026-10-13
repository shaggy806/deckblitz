/**
 * The set walk, batch 67, part a (2026-10-12): Tarkir: Dragonstorm.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
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
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

const SPIRIT_1 = "Spirit Token (Great Arashin City)";
const SPIRIT_2 = "Spirit Token (Anafenza, Unyielding Lineage)";

describe("Anafenza, Unyielding Lineage", () => {
  it("endures 2 on another nontoken creature dying: counters or a 2/2 Spirit, as chosen", () => {
    const { game, a } = table();
    const anafenza = spawn(game, "Anafenza, Unyielding Lineage");
    pickModes(a, 0);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, anafenza)).toBe(2);
    pickModes(a, 1);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, anafenza)).toBe(2);
    expect(tokensNamed(game, SPIRIT_2, A)).toBe(1);
    const [spirit] = named(game, SPIRIT_2);
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    // A token dying doesn't trigger it, nor does an opponent's creature.
    pickModes(a, 0);
    destroy(game, spirit);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, anafenza)).toBe(2);
  });

  it("dying alongside them, it just makes the Spirits — no choice of counters", () => {
    const { game, a } = table();
    spawn(game, "Anafenza, Unyielding Lineage");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(asked).toBe(0);
    expect(tokensNamed(game, SPIRIT_2, A)).toBe(2);
  });
});

describe("Sinkhole Surveyor", () => {
  it("attacking costs 1 life and endures 1", () => {
    const { game, a } = table();
    const surveyor = spawn(game, "Sinkhole Surveyor");
    pickModes(a, 1);
    attack(game, a, [surveyor]);
    expect(life(game, A)).toBe(19);
    expect(tokensNamed(game, SPIRIT_1, A)).toBe(1);
    expect(counters(game, surveyor)).toBe(0);
    expect(life(game, B)).toBe(19);
  });
});

describe("Great Arashin City", () => {
  it("enters tapped without a Forest or Plains, untapped with one, and exiles a creature card for a 1/1 Spirit", () => {
    const { game } = table();
    const first = enter(game, "Great Arashin City");
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Plains");
    const city = enter(game, "Great Arashin City");
    expect(game.state.objects[city].tapped).toBe(false);
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, city, 1);
    expect(zone(game, bears)).toBe("exile");
    const [spirit] = named(game, SPIRIT_1);
    expect(pt(game, spirit)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, spirit).has("flying")).toBe(false);
  });
});

describe("Spectral Denial", () => {
  it("takes {1} per power-4 creature off its {X}, and still asks for the full {X}", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm");
    spawn(game, "Craw Wurm");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    // One Island for the {U}; the two Craw Wurms pay for X = 2. A spare
    // Wastes could pay {1}, not {2}.
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Spectral Denial"), { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Focus the Mind", () => {
  it("costs {2} less once you've cast another spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const focus = toHand(game, "Focus the Mind");
    expect(canCast(game, focus)).toBe(false);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(canCast(game, focus)).toBe(true);
    const before = hand(game).length;
    cast(game, focus);
    expect(hand(game).length).toBe(before - 1 + 3 - 1);
  });
});

describe("Highspire Bell-Ringer", () => {
  it("takes {1} off the second spell each turn only", () => {
    const { game } = table();
    spawn(game, "Highspire Bell-Ringer");
    const first = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(canCast(game, first)).toBe(false);
    lands(game, "Forest", 1);
    cast(game, first);
    const second = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(canCast(game, second)).toBe(true);
    cast(game, second);
    const third = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(canCast(game, third)).toBe(false);
  });
});

describe("The Sibsig Ceremony", () => {
  it("discounts a creature you cast, then trades it for a Zombie Druid; one that wasn't cast stays", () => {
    const { game } = table();
    spawn(game, "The Sibsig Ceremony");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Druid Token", A)).toBe(1);
    const giant = enter(game, "Hill Giant");
    expect(zone(game, giant)).toBe("battlefield");
    expect(tokensNamed(game, "Zombie Druid Token", A)).toBe(1);
  });
});

describe("Lotuslight Dancers", () => {
  it("finds one card per colour, a multicoloured card filling any one slot", () => {
    const { game, a } = table();
    const familiar = toLibrary(game, "Fangkeeper's Familiar");
    const bears = toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a, familiar, bears);
    enter(game, "Lotuslight Dancers");
    expect(seen.offered).toContain(familiar);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, familiar)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("library");
  });
});

describe("Stillness in Motion", () => {
  it("mills three; with the library then empty, exiles itself and stacks five from the graveyard", () => {
    const { game } = table();
    const stillness = spawn(game, "Stillness in Motion");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, stillness)).toBe("battlefield");
    const library = (): number => game.state.zones.perPlayer[A].library.length;
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: library() - 3 }, []);
    settle(game);
    expect(library()).toBe(3);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, stillness)).toBe("exile");
    expect(library()).toBe(5);
  });
});

describe("Runescale Stormbrood", () => {
  it("gets +2/+0 for a noncreature spell or a Dragon spell, not another creature spell", () => {
    const { game } = table();
    const brood = spawn(game, "Runescale Stormbrood");
    lands(game, "Mountain", 10);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pt(game, brood).power).toBe(2);
    cast(game, toHand(game, "Shivan Dragon"));
    expect(pt(game, brood).power).toBe(4);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, brood).power).toBe(6);
  });
});

describe("Starry-Eyed Skyrider", () => {
  it("gives attacking tokens flying, and another target creature flying on its attack", () => {
    const { game, a } = table();
    const rider = spawn(game, "Starry-Eyed Skyrider");
    // Real tokens (a debug-spawned token card isn't one).
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 2 }, []);
    settle(game);
    const [goblin, home] = named(game, "Goblin Token");
    for (const id of [goblin, home]) game.state.objects[id].summoningSick = false;
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [rider, goblin, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(keywords(game, goblin).has("flying")).toBe(true);
    expect(keywords(game, home).has("flying")).toBe(false);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Zurgo's Vanguard", () => {
  it("has power equal to the creatures you control", () => {
    const { game } = table();
    const vanguard = spawn(game, "Zurgo's Vanguard");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, vanguard)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Death Begets Life", () => {
  it("draws one for each creature and enchantment destroyed, not for an indestructible one", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "War Effort", B);
    spawn(game, "Darksteel Myr");
    const before = hand(game).length;
    cast(game, toHand(game, "Death Begets Life"));
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Yathan Tombguard", () => {
  it("draws and loses 1 life when a creature with a counter on it hits a player", () => {
    const { game, a } = table();
    const guard = spawn(game, "Yathan Tombguard");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const before = hand(game).length;
    attack(game, a, [guard, bears]);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("War Effort", () => {
  it("anthem +1/+0, and a tapped attacking Warrior whenever you attack", () => {
    const { game, a } = table();
    spawn(game, "War Effort");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    // Bears 3 and the Warrior 2.
    expect(life(game, B)).toBe(15);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(0);
  });
});

describe("Corroding Dragonstorm", () => {
  it("drains 2 and surveils on entering, and goes back to hand when a Dragon enters", () => {
    const { game } = table();
    const storm = enter(game, "Corroding Dragonstorm");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    enter(game, "Shivan Dragon");
    expect(zone(game, storm)).toBe("hand");
  });
});

describe("Fangkeeper's Familiar", () => {
  it("can destroy target enchantment as it enters", () => {
    const { game, a } = table();
    const effort = spawn(game, "War Effort", B);
    pickModes(a, 1);
    pickTargets(a, effort);
    enter(game, "Fangkeeper's Familiar");
    expect(zone(game, effort)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });
});

describe("Frontline Rush", () => {
  it("pumps the target by the creatures you control", () => {
    const { game } = table();
    lands(game, "Plateau", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Frontline Rush"), { modes: [1], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Skimming Strike", () => {
  it("draws even with no creature targeted, and shuffles back into the library", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const card = toHand(game, "Dirgur Island Dragon");
    const before = hand(game).length;
    cast(game, card, { face: 1, targets: [null] });
    expect(hand(game).length).toBe(before);
    expect(zone(game, card)).toBe("library");
    void graveyard;
  });
});

// Batch 66 blocked it on an Nth-spell discount; Highspire Bell-Ringer's
// shape is that discount, exactly.
describe("Uthros Psionicist", () => {
  it("counts itself as the first spell: the second costs {2} less, the third full price", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Uthros Psionicist"));
    const giant = toHand(game, "Hill Giant");
    lands(game, "Mountain", 2);
    expect(canCast(game, giant)).toBe(true);
    cast(game, giant);
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(canCast(game, bears)).toBe(false);
  });
});
