/**
 * The set walk, batch 66, part a (2026-10-12): Edge of Eternities.
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
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);
const canActivate = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);
const libraryOf = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked ?? 0;

describe("Space-Time Anomaly", () => {
  it("mills the target player as many cards as the caster's life total", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    game.state.players[A].life = 7;
    game.state.players[B].life = 30;
    const before = libraryOf(game, B).length;
    cast(game, toHand(game, "Space-Time Anomaly"), { targets: [ref(B)] });
    expect(libraryOf(game, B).length).toBe(before - 7);
    expect(graveyard(game, B).length).toBe(7);
  });
});

describe("Requiem Monolith", () => {
  it("the creature's controller draws and loses life for the damage, when they let the Monolith deal 1", () => {
    const { game, b } = table();
    const monolith = spawn(game, "Requiem Monolith");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(b, 0); // bob has the Monolith deal 1 damage to his creature
    const bobHand = hand(game, B).length;
    const aliceHand = hand(game, A).length;
    activate(game, monolith, 0, { targets: [ref(giant)] });
    expect(damage(game, giant)).toBe(1);
    expect(hand(game, B).length).toBe(bobHand + 1);
    expect(life(game, B)).toBe(19);
    expect(hand(game, A).length).toBe(aliceHand);
    expect(life(game, A)).toBe(20);
  });

  it("deals nothing when the controller declines, and lethal damage later in the turn still triggers it", () => {
    const { game, a } = table();
    const monolith = spawn(game, "Requiem Monolith");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a); // alice declines
    activate(game, monolith, 0, { targets: [ref(bears)] });
    expect(damage(game, bears)).toBe(0);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game, A).length;
    cast(game, bolt, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1 + 3);
    expect(life(game, A)).toBe(17);
  });
});

describe("Virulent Silencer", () => {
  it("gives two poison counters for a nontoken artifact creature's combat damage, none for a token's", () => {
    const { game, a } = table();
    const silencer = spawn(game, "Virulent Silencer");
    game.debugApplyEffect(A, { kind: "create-token", token: "Robot Token", count: 1 }, []);
    const [robot] = named(game, "Robot Token", A);
    expect(game.state.objects[robot].isToken).toBe(true);
    game.state.objects[robot].summoningSick = false;
    attack(game, a, [silencer, robot]);
    expect(life(game, B)).toBe(16);
    expect(game.state.players[B].counters.poison ?? 0).toBe(2);
  });
});

describe("Zero Point Ballad", () => {
  it("with X of 6, destroys toughness 6 or less, costs 6 life, and returns a creature card it put into any graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 7);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const bears = spawn(game, "Grizzly Bears");
    const brontodon = spawn(game, "Ancient Brontodon", B);
    const older = toGraveyard(game, "Hill Giant", B);
    const seen = pickFromZone(a, dreadmaw);
    cast(game, toHand(game, "Zero Point Ballad"), { x: 6 });
    expect(zone(game, brontodon)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect([...seen.offered].sort()).toEqual([dreadmaw, bears].sort());
    expect(seen.offered).not.toContain(older);
    expect(named(game, "Colossal Dreadmaw", A)).toHaveLength(1);
    expect(life(game, A)).toBe(14);
  });

  it("with X below 6 returns nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Zero Point Ballad"), { x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(seen.offered).toHaveLength(0);
    expect(life(game, A)).toBe(18);
  });
});

describe("Divert Disaster", () => {
  /** Bob casts Grizzly Bears on his turn with four Forests; alice gets priority with it on the stack. */
  const bobCastsBears = (): { game: Game; b: ReturnType<typeof table>["b"]; bears: ObjectId } => {
    const { game, b } = table();
    lands(game, "Island", 2);
    nextTurn(game);
    lands(game, "Forest", 4, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.includes(bears));
    return { game, b, bears };
  };

  it("if its controller pays {2}, the spell resolves and the caster of Divert Disaster creates a Lander", () => {
    const { game, b, bears } = bobCastsBears();
    pickModes(b, 0);
    cast(game, toHand(game, "Divert Disaster"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
    expect(tokensNamed(game, "Lander Token", B)).toBe(0);
  });

  it("if they don't, it's countered and nobody gets a Lander", () => {
    const { game, b, bears } = bobCastsBears();
    pickModes(b);
    cast(game, toHand(game, "Divert Disaster"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Lander Token")).toBe(0);
  });
});

describe("Larval Scoutlander", () => {
  it("may sacrifice a Lander instead of a land to fetch two basics tapped", () => {
    const { game, a } = table();
    const lander = spawn(game, "Lander Token");
    const plains = spawn(game, "Plains");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).toContain(plains);
      return [lander];
    };
    const [w1, w2] = libraryOf(game, A);
    pickFromZone(a, w1, w2);
    const scout = enter(game, "Larval Scoutlander");
    expect(zone(game, lander)).not.toBe("battlefield");
    expect(zone(game, plains)).toBe("battlefield");
    expect([zone(game, w1), zone(game, w2)]).toEqual(["battlefield", "battlefield"]);
    expect([game.state.objects[w1].tapped, game.state.objects[w2].tapped]).toEqual([true, true]);
    expect(types(game, scout)).not.toContain("creature");
  });
});

describe("Sledge-Class Seedship", () => {
  it("is a 4/5 flier at 7 charge counters, and puts a creature card from hand onto the battlefield as it attacks", () => {
    const { game, a } = table();
    const ship = spawn(game, "Sledge-Class Seedship");
    expect(types(game, ship)).not.toContain("creature");
    game.state.objects[ship].counters.charge = 7;
    expect(types(game, ship)).toContain("creature");
    expect(pt(game, ship)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, ship).has("flying")).toBe(true);
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    pickFromZone(a, dreadmaw);
    attack(game, a, [ship]);
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(game.state.objects[dreadmaw].attacking).toBeNull();
    expect(life(game, B)).toBe(16);
  });
});

describe("Lumen-Class Frigate", () => {
  it("pumps other creatures from 2 counters, and is a 3/5 flying lifelinker that doesn't pump itself at 12", () => {
    const { game } = table();
    const frigate = spawn(game, "Lumen-Class Frigate");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.state.objects[frigate].counters.charge = 2;
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(types(game, frigate)).not.toContain("creature");
    game.state.objects[frigate].counters.charge = 12;
    expect(types(game, frigate)).toContain("creature");
    expect(pt(game, frigate)).toEqual({ power: 3, toughness: 5 });
    expect([...keywords(game, frigate)].sort()).toEqual(["flying", "lifelink"]);
  });
});

describe("Astelli Reclaimer", () => {
  it("X is the mana spent: cast for warp ({2}{W}) it reaches a noncreature, nonland permanent card of mana value 3 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const ring = toGraveyard(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    const lotus = toGraveyard(game, "Gilded Lotus");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, (offered) => offered.map(() => stone));
    cast(game, toHand(game, "Astelli Reclaimer"), { via: "warp" });
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([ring, stone].sort());
    expect(zone(game, stone)).toBe("battlefield");
    expect(zone(game, lotus)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("cast for its full cost, X is 5", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const lotus = toGraveyard(game, "Gilded Lotus");
    const ring = toGraveyard(game, "Sol Ring");
    const seen = watchTargets(a, () => [lotus]);
    cast(game, toHand(game, "Astelli Reclaimer"));
    expect([...seen.offered[0]].sort()).toEqual([lotus, ring].sort());
    expect(zone(game, lotus)).toBe("battlefield");
  });
});

describe("Dyadrine, Synthesis Amalgam", () => {
  it("enters with a counter per mana spent, and trades a counter off each of two creatures for a card and a Robot", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 2);
    const dyadrine = toHand(game, "Dyadrine, Synthesis Amalgam");
    cast(game, dyadrine, { x: 3 });
    expect(counters(game, dyadrine)).toBe(5);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    game.state.objects[dyadrine].summoningSick = false;
    pickModes(a, 0);
    const seen = pickPermanents(a, dyadrine, bears);
    const before = hand(game, A).length;
    attack(game, a, [dyadrine]);
    expect([...seen.offered].sort()).toEqual([dyadrine, bears].sort());
    expect(counters(game, dyadrine)).toBe(4);
    expect(counters(game, bears)).toBe(0);
    expect(hand(game, A).length).toBe(before + 1);
    expect(tokensNamed(game, "Robot Token", A)).toBe(1);
  });

  it("isn't offered without two creatures that have a +1/+1 counter", () => {
    const { game, a } = table();
    const dyadrine = spawn(game, "Dyadrine, Synthesis Amalgam");
    game.state.objects[dyadrine].counters["+1/+1"] = 3;
    spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const before = hand(game, A).length;
    attack(game, a, [dyadrine]);
    expect(asked).toBe(0);
    expect(counters(game, dyadrine)).toBe(3);
    expect(hand(game, A).length).toBe(before);
    expect(tokensNamed(game, "Robot Token")).toBe(0);
  });
});

describe("Meltstrider Eulogist", () => {
  it("draws when a creature you control with a +1/+1 counter dies, itself included", () => {
    const { game } = table();
    const eulogist = spawn(game, "Meltstrider Eulogist");
    const plain = spawn(game, "Grizzly Bears");
    const grown = spawn(game, "Grizzly Bears");
    game.state.objects[grown].counters["+1/+1"] = 1;
    const before = hand(game, A).length;
    destroy(game, plain);
    expect(hand(game, A).length).toBe(before);
    destroy(game, grown);
    expect(hand(game, A).length).toBe(before + 1);
    game.state.objects[eulogist].counters["+1/+1"] = 1;
    destroy(game, eulogist);
    expect(hand(game, A).length).toBe(before + 2);
  });
});

describe("Seedship Broodtender", () => {
  it("returns a Spacecraft card, which isn't a creature card, from your graveyard", () => {
    const { game } = table();
    const tender = spawn(game, "Seedship Broodtender");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    const ship = toGraveyard(game, "Sledge-Class Seedship");
    const ring = toGraveyard(game, "Sol Ring");
    const offer = game
      .legalActions(A)
      .find((x): x is Extract<typeof x, { kind: "activate-ability" }> => x.kind === "activate-ability" && x.source === tender);
    expect(offer?.targetOptions?.[0]).toEqual([ref(ship)]);
    expect(ring).toBeDefined();
    activate(game, tender, 0, { targets: [ref(ship)] });
    expect(zone(game, ship)).toBe("battlefield");
    expect(zone(game, tender)).toBe("graveyard");
  });
});

describe("Steelswarm Operator", () => {
  it("its {U}{U} pays for an artifact's ability but not for a spell", () => {
    const { game } = table();
    const operator = spawn(game, "Steelswarm Operator");
    const lander = spawn(game, "Lander Token");
    const counterspell = toHand(game, "Counterspell");
    activate(game, operator, 1);
    expect(game.state.players[A].manaPool).toHaveLength(2);
    expect(canCast(game, counterspell)).toBe(false);
    expect(canActivate(game, lander)).toBe(true);
  });

  it("its {U} casts an artifact spell and nothing else", () => {
    const { game } = table();
    const operator = spawn(game, "Steelswarm Operator");
    const ring = toHand(game, "Sol Ring");
    const opt = toHand(game, "Opt");
    activate(game, operator, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["U"]);
    expect(canCast(game, opt)).toBe(false);
    expect(canCast(game, ring)).toBe(true);
  });
});
