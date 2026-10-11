/**
 * The set walk, batch 54, part a (2026-10-11): The Hobbit's last cards and Marvel Super Heroes Commander's first.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
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
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const army = (game: Game, player = A): ObjectId => {
  const [id] = named(game, "Army Token", player);
  expect(id).toBeDefined();
  return id;
};

describe("Desolation of Smaug", () => {
  it("deals 3 to each non-Dragon creature, then adds four mana spendable only on Dragon spells", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Desolation of Smaug"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, dragon)).toBe("battlefield");
    expect(game.state.objects[dragon].damageMarked).toBe(0);

    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(4);
    // Not on a non-Dragon spell, even one the mana would otherwise pay for.
    const splitter = toHand(game, "Bonesplitter");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: splitter, targets: [] })).not.toBeNull();
    // On a Dragon spell, with two more for its {R}{R}.
    lands(game, "Mountain", 2);
    const shivan = toHand(game, "Shivan Dragon");
    cast(game, shivan);
    expect(zone(game, shivan)).toBe("battlefield");
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });
});

describe("Tom, Bert, and William", () => {
  it("draws the sacrificed creature's power, then discards one — never sacrificing themselves", () => {
    const { game } = table();
    const trolls = spawn(game, "Tom, Bert, and William");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    const sacrificing = (victim: ObjectId): unknown =>
      game.dispatch({ type: "activate-ability", player: A, source: trolls, abilityIndex: 0, targets: [], sacrifice: victim });
    expect(() => sacrificing(trolls)).toThrow(/requires sacrificing/);
    sacrificing(giant);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, trolls)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 3 - 1);
  });

  it("come back as a legendary noncreature artifact, no longer a Troll, under the trigger's controller", () => {
    const { game } = table();
    // Bob's card, under Alice's control as it dies: it returns to Alice (rule 110.2a).
    const trolls = spawn(game, "Tom, Bert, and William", B);
    game.state.objects[trolls].controller = A;
    destroy(game, trolls);
    const [back] = named(game, "Tom, Bert, and William");
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(A);
    expect(types(game, back)).toEqual(["artifact"]);
    expect(subtypes(game, back)).not.toContain("Troll");
    expect(supertypes(game, back)).toContain("legendary");
    // Not a creature now, so dying isn't possible and destroying them leaves them gone.
    destroy(game, back);
    expect(named(game, "Tom, Bert, and William")).toHaveLength(0);
  });
});

describe("Iron Hills Blacksmith", () => {
  it("makes an Axe that gives +1/+0 and equips for {2}", () => {
    const { game } = table();
    const smith = enter(game, "Iron Hills Blacksmith");
    expect(keywords(game, smith).has("double-strike")).toBe(true);
    const [axe] = named(game, "Axe Token");
    expect(axe).toBeDefined();
    expect(types(game, axe)).toEqual(["artifact"]);
    toStep(game, "postcombat-main");
    lands(game, "Wastes", 2);
    activate(game, axe, 0, { targets: [ref(smith)] });
    expect(pt(game, smith)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Little Bear", () => {
  it("untaps another creature you control, and grows it only if it's a Bear", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    const seen = watchTargets(a, () => [bears]);
    const little = enter(game, "Little Bear");
    expect(seen.offered[0]).not.toContain(little);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(counters(game, bears)).toBe(1);

    pickTargets(a, giant);
    enter(game, "Little Bear");
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(counters(game, giant)).toBe(0);
  });
});

describe("Uncover the Moon-Letters", () => {
  it("may draw X for the mana spent on a noncreature spell, then discards two", () => {
    const { game, a } = table();
    spawn(game, "Uncover the Moon-Letters");
    lands(game, "Island", 3);
    const div = toHand(game, "Divination");
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, div);
    // -1 (Divination) +3 (X = 3) -2 (discard) +2 (Divination).
    expect(hand(game).length).toBe(before - 1 + 3 - 2 + 2);
  });

  it("declining draws nothing and discards nothing", () => {
    const { game, a } = table();
    spawn(game, "Uncover the Moon-Letters");
    lands(game, "Island", 3);
    const div = toHand(game, "Divination");
    const before = hand(game).length;
    pickModes(a);
    cast(game, div);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Woodland Weavemaster", () => {
  it("grows when another Elf enters and makes X mana spendable only on Elves", () => {
    const { game } = table();
    const weave = spawn(game, "Woodland Weavemaster");
    enter(game, "Llanowar Elves");
    expect(pt(game, weave)).toEqual({ power: 2, toughness: 3 });
    toStep(game, "postcombat-main");
    game.dispatch({ type: "activate-ability", player: A, source: weave, abilityIndex: 0, targets: [], manaColors: ["G"] });
    settle(game);
    expect(game.state.players[A].manaPool).toHaveLength(2);
    const bears = toHand(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [] })).not.toBeNull();
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Along the Crooked Way", () => {
  it("returns a creature card, amassing for it and for each creature card that leaves later", () => {
    const { game, a } = table();
    const bearsCard = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bearsCard);
    enter(game, "Along the Crooked Way");
    expect(zone(game, bearsCard)).toBe("hand");
    const goblins = army(game);
    expect(counters(game, goblins)).toBe(1);
    expect(subtypes(game, goblins)).toContain("Goblin");

    // Two creature cards and a land leaving together: once per creature card.
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: "each-player" }, []);
    settle(game);
    expect(counters(game, goblins)).toBe(3);
  });

  it("gives Goblins and Orcs you control menace", () => {
    const { game } = table();
    const way = spawn(game, "Along the Crooked Way");
    const goblin = spawn(game, "Raging Goblin");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    activate(game, way, 0);
    expect(keywords(game, goblin).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});

describe("Tidings of War", () => {
  it("amasses Goblins 1 from the hand and 3 when flashed back", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const tidings = toHand(game, "Tidings of War");
    cast(game, tidings);
    const goblins = army(game);
    expect(counters(game, goblins)).toBe(1);
    expect(zone(game, tidings)).toBe("graveyard");
    cast(game, tidings, { via: "flashback" });
    expect(counters(game, goblins)).toBe(4);
    expect(zone(game, tidings)).toBe("exile");
  });
});

describe("Goblin-town Flunkies", () => {
  it("amasses Goblins 1 as it enters", () => {
    const { game } = table();
    enter(game, "Goblin-town Flunkies");
    expect(counters(game, army(game))).toBe(1);
  });
});

describe("Misty Mountains Raider", () => {
  it("amasses Goblins 2 whenever you attack", () => {
    const { game, a } = table();
    spawn(game, "Misty Mountains Raider");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, army(game))).toBe(2);
  });
});

describe("Great Ugly-Looking Goblin // Clap! Snap!", () => {
  it("Clap! Snap! amasses Goblins 2 and goes on an adventure; the Goblin gives countered creatures menace", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const card = toHand(game, "Great Ugly-Looking Goblin");
    cast(game, card, { face: 1 });
    const goblins = army(game);
    expect(counters(game, goblins)).toBe(2);
    expect(zone(game, card)).toBe("exile");
    expect(keywords(game, goblins).has("menace")).toBe(false);

    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);
    if (offer?.kind !== "cast-spell") throw new Error("not offered from exile");
    cast(game, card, { via: offer.via });
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, goblins).has("menace")).toBe(true);
    expect(keywords(game, card).has("menace")).toBe(false);
  });
});

describe("Iron Man, Armored Avenger", () => {
  it("puts a counter on a target creature whenever you draw", () => {
    const { game, a } = table();
    spawn(game, "Iron Man, Armored Avenger");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(counters(game, bears)).toBe(2);
  });

  it("gives other attacking modified creatures flying, not unmodified ones", () => {
    const { game, a } = table();
    const iron = spawn(game, "Iron Man, Armored Avenger");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[bears].counters["+1/+1"] = 1;
    attack(game, a, [iron, bears, giant]);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, giant).has("flying")).toBe(false);
  });
});

describe("Black Widow, Agile Avenger", () => {
  it("grows and draws when an opponent draws their second card each turn — once per opponent", () => {
    const { game } = table({ players: 3 });
    const widow = spawn(game, "Black Widow, Agile Avenger");
    expect(keywords(game, widow).has("menace")).toBe(true);
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 3 }, []);
    settle(game);
    expect(counters(game, widow)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    game.debugApplyEffect(C, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(counters(game, widow)).toBe(1);
    game.debugApplyEffect(C, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(counters(game, widow)).toBe(2);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Hulkbuster Armor", () => {
  it("equips a Hero for {3}, anything for {6}, and makes it a 9/9 flier", () => {
    const { game } = table();
    const armor = spawn(game, "Hulkbuster Armor");
    const falcon = spawn(game, "Falcon and Redwing");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 9);
    const offered = (index: number): ObjectId[] => {
      const offer = game
        .legalActions(A)
        .find((o) => o.kind === "activate-ability" && o.source === armor && o.abilityIndex === index);
      if (offer?.kind !== "activate-ability") throw new Error(`no ability ${index}`);
      return (offer.targetOptions?.[0] ?? []).flatMap((t) => (t.kind === "object" ? [t.object] : []));
    };
    expect(offered(0)).toEqual([falcon]);
    expect(offered(1)).toEqual(expect.arrayContaining([falcon, bears]));
    expect(() => activate(game, armor, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, armor, 0, { targets: [ref(falcon)] });
    expect(pt(game, falcon)).toEqual({ power: 9, toughness: 9 });
    activate(game, armor, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 9, toughness: 9 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(pt(game, falcon)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Multiversal Recruitment", () => {
  it("copies a creature you control as a nonlegendary token", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    cast(game, toHand(game, "Multiversal Recruitment"), { targets: [ref(isamaru)] });
    const both = named(game, "Isamaru, Hound of Konda");
    expect(both).toHaveLength(2);
    const token = both.find((id) => id !== isamaru) as ObjectId;
    expect(supertypes(game, token)).not.toContain("legendary");
  });
});

describe("Falcon and Redwing", () => {
  it("makes a Bird per combat damage dealt to a player, then gets a counter", () => {
    const { game, a } = table();
    const falcon = spawn(game, "Falcon and Redwing");
    attack(game, a, [falcon]);
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);
    expect(counters(game, falcon)).toBe(1);
  });
});
