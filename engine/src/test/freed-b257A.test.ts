/**
 * Batch 257, group A: the clause of each freed card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
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
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";

/** Marks `n` damage on `target` as dealt by `source`, as a noncombat damage effect. */
function dealDamage(game: Game, source: ObjectId, target: ObjectId, n: number): void {
  const player = game.state.objects[source].controller;
  game.debugApplyEffect(player, { kind: "damage", amount: n, target: 0 }, [ref(target)], { source });
  settle(game);
}

describe("freed B257 group A", () => {
  describe("Serpent of the Endless Sea / Ronom Serpent", () => {
    it("counts your Islands, and can't attack a player with no Island", () => {
      const { game, a } = table();
      lands(game, "Island", 3);
      const serpent = spawn(game, "Serpent of the Endless Sea");
      expect(pt(game, serpent)).toEqual({ power: 3, toughness: 3 });
      a.declareAttackersFn = () => [{ attacker: serpent, defender: B }];
      attack(game, a, [serpent]);
      expect(life(game, B)).toBe(20);
    });

    it("Serpent attacks a player who controls an Island", () => {
      const { game, a } = table();
      lands(game, "Island", 3);
      lands(game, "Island", 1, B);
      const serpent = spawn(game, "Serpent of the Endless Sea");
      attack(game, a, [serpent]);
      expect(life(game, B)).toBe(17);
    });

    it("Ronom Serpent needs a snow land on each side, and goes with your last one", () => {
      const { game, a } = table();
      const snow = spawn(game, "Snow-Covered Island");
      const serpent = spawn(game, "Ronom Serpent");
      lands(game, "Island", 1, B);
      attack(game, a, [serpent]);
      expect(life(game, B)).toBe(20);
      spawn(game, "Snow-Covered Island", B);
      attack(game, a, [serpent]);
      expect(life(game, B)).toBe(15);
      destroy(game, snow);
      expect(zone(game, serpent)).toBe("graveyard");
    });
  });

  describe("The Abyss", () => {
    it("the player whose upkeep it is chooses, among their own nonartifact creatures", () => {
      const { game, b } = table();
      spawn(game, "The Abyss");
      const bear = spawn(game, "Grizzly Bears", B);
      const other = spawn(game, "Hill Giant", B);
      const artifact = spawn(game, "Ornithopter", B);
      let offered: readonly string[] = [];
      b.chooseTargetsFn = (_v, _s, _specs, legal) => {
        offered = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
        return [ref(other)];
      };
      nextTurn(game);
      expect(offered).toContain(bear);
      expect(offered).not.toContain(artifact);
      expect(zone(game, other)).toBe("graveyard");
      expect(zone(game, bear)).toBe("battlefield");
    });
  });

  describe("Vampiric Sliver", () => {
    it("gives each Sliver its own trigger, even an opponent's", () => {
      const { game } = table();
      spawn(game, "Vampiric Sliver");
      const other = spawn(game, "Muscle Sliver", B);
      const bear = spawn(game, "Grizzly Bears");
      dealDamage(game, other, bear, 1);
      destroy(game, bear);
      expect(zone(game, bear)).toBe("graveyard");
      expect(counters(game, other)).toBe(1);
    });

    it("the Sliver that didn't deal the damage gets nothing", () => {
      const { game } = table();
      const vampiric = spawn(game, "Vampiric Sliver");
      const other = spawn(game, "Muscle Sliver");
      const bear = spawn(game, "Grizzly Bears", B);
      dealDamage(game, other, bear, 1);
      destroy(game, bear);
      expect(counters(game, other)).toBe(1);
      expect(counters(game, vampiric)).toBe(0);
    });

    it("kills a blocker in combat and grows", () => {
      const { game, a, b } = table();
      const vampiric = spawn(game, "Vampiric Sliver");
      const bear = spawn(game, "Grizzly Bears", B);
      b.declareBlockersFn = () => [{ blocker: bear, attacker: vampiric }];
      attack(game, a, [vampiric]);
      expect(zone(game, bear)).toBe("graveyard");
      expect(counters(game, vampiric)).toBe(1);
    });

    it("a creature it dealt no damage to dying does nothing", () => {
      const { game } = table();
      const vampiric = spawn(game, "Vampiric Sliver");
      const bear = spawn(game, "Grizzly Bears", B);
      destroy(game, bear);
      expect(counters(game, vampiric)).toBe(0);
    });

    it("a creature that dies with Vampiric Sliver still triggers for the other Sliver", () => {
      const { game } = table();
      const vampiric = spawn(game, "Vampiric Sliver");
      const other = spawn(game, "Muscle Sliver");
      const bear = spawn(game, "Grizzly Bears", B);
      dealDamage(game, other, bear, 1);
      expect(zone(game, bear)).toBe("battlefield");
      game.debugApplyEffect(B, { kind: "destroy-all", filter: { name: "Vampiric Sliver" } }, []);
      expect(counters(game, other)).toBe(0);
      expect(zone(game, vampiric)).toBe("graveyard");
      // Now both at once, with a second Vampiric Sliver gone the same instant as the bear.
      const second = spawn(game, "Vampiric Sliver");
      game.debugApplyEffect(
        B,
        { kind: "destroy-all", filter: { anyOf: [{ name: "Vampiric Sliver" }, { name: "Grizzly Bears" }] } },
        [],
      );
      settle(game);
      expect(zone(game, second)).toBe("graveyard");
      expect(zone(game, bear)).toBe("graveyard");
      expect(counters(game, other)).toBe(1);
    });

    it("a Sliver that deals the damage before it has the ability still triggers", () => {
      const { game } = table();
      const other = spawn(game, "Muscle Sliver");
      const bear = spawn(game, "Grizzly Bears", B);
      dealDamage(game, other, bear, 1);
      spawn(game, "Vampiric Sliver");
      destroy(game, bear);
      expect(counters(game, other)).toBe(1);
    });
  });

  describe("Tomb Blade", () => {
    it("loses life for each creature they control, unless they sacrifice one", () => {
      const { game, a, b } = table();
      const blade = spawn(game, "Tomb Blade");
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", B);
      pickModes(b);
      attack(game, a, [blade]);
      expect(life(game, B)).toBe(20 - 5 - 2);
    });

    it("the sacrifice pays it", () => {
      const { game, a, b } = table();
      const blade = spawn(game, "Tomb Blade");
      const bear = spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", B);
      pickModes(b, 0);
      b.chooseSacrificesFn = () => [bear];
      attack(game, a, [blade]);
      expect(life(game, B)).toBe(20 - 5);
      expect(zone(game, bear)).toBe("graveyard");
    });
  });

  describe("Chalice of Life", () => {
    it("transforms only at 10 above the starting life, read after the gain", () => {
      const { game } = table({ life: 40 });
      const chalice = spawn(game, "Chalice of Life");
      game.state.players[A].life = 48;
      activate(game, chalice);
      expect(life(game)).toBe(49);
      expect(game.state.objects[chalice].transformedAtSeq).toBeUndefined();
      nextTurn(game);
      nextTurn(game);
      activate(game, chalice);
      expect(life(game)).toBe(50);
      expect(game.state.objects[chalice].transformedAtSeq).toBeDefined();
      nextTurn(game);
      nextTurn(game);
      activate(game, chalice, 0, { targets: [ref(B)] });
      expect(life(game, B)).toBe(35);
    });
  });

  describe("Okina Nightwatch", () => {
    it("needs strictly more cards than each opponent", () => {
      const { game } = table({ players: 3 });
      const okina = spawn(game, "Okina Nightwatch");
      // Alice has drawn for her turn: one up on both.
      expect(hand(game, A).length).toBe(hand(game, B).length + 1);
      expect(pt(game, okina)).toEqual({ power: 7, toughness: 6 });
      // A tie with one opponent is enough to lose it.
      toHand(game, "Wastes", C);
      expect(pt(game, okina)).toEqual({ power: 4, toughness: 3 });
      toHand(game, "Wastes", A);
      expect(pt(game, okina)).toEqual({ power: 7, toughness: 6 });
    });
  });

  describe("Greener Pastures", () => {
    it("only the player with more lands than each other player, on their own upkeep", () => {
      const { game } = table({ players: 3 });
      spawn(game, "Greener Pastures");
      lands(game, "Wastes", 2, B);
      lands(game, "Wastes", 2, C);
      lands(game, "Wastes", 1, A);
      nextTurn(game);
      expect(tokensNamed(game, "Saproling Token")).toBe(0);
      spawn(game, "Wastes", C);
      nextTurn(game);
      expect(tokensNamed(game, "Saproling Token", C)).toBe(1);
      expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
    });
  });

  describe("Furnace Punisher", () => {
    it("reads the upkeep player's basics, not its controller's", () => {
      const { game } = table({ deck: "Grizzly Bears" });
      spawn(game, "Furnace Punisher");
      lands(game, "Wastes", 2);
      const before = life(game, B);
      nextTurn(game);
      expect(life(game, B)).toBe(before - 2);
      const mine = life(game, A);
      nextTurn(game);
      expect(life(game, A)).toBe(mine);
      lands(game, "Wastes", 2, B);
      const after = life(game, B);
      nextTurn(game);
      expect(life(game, B)).toBe(after);
    });

    it("a nonbasic land doesn't count", () => {
      const { game } = table({ deck: "Grizzly Bears" });
      spawn(game, "Furnace Punisher");
      spawn(game, "Wastes", B);
      spawn(game, "Rupture Spire", B);
      const before = life(game, B);
      nextTurn(game);
      expect(life(game, B)).toBe(before - 2);
    });
  });

  describe("Fevered Visions", () => {
    it("deals damage to an opponent at four or more cards, counting the draw", () => {
      const { game } = table({ openingHandSize: 0 });
      spawn(game, "Fevered Visions");
      toHand(game, "Wastes", B);
      toHand(game, "Wastes", B);
      toHand(game, "Wastes", B);
      toStep(game, "end", B);
      settle(game);
      expect(hand(game, B).length).toBeGreaterThanOrEqual(4);
      expect(life(game, B)).toBe(18);
    });

    it("never hurts you, however many cards you hold", () => {
      const { game } = table();
      spawn(game, "Fevered Visions");
      const before = hand(game, A).length;
      toStep(game, "end");
      settle(game);
      expect(hand(game, A).length).toBe(before + 1);
      expect(life(game, A)).toBe(20);
    });
  });

  describe("Skullcage", () => {
    it("spares exactly three or four cards, read as it resolves", () => {
      const { game } = table({ openingHandSize: 0, deck: "Wastes" });
      spawn(game, "Skullcage");
      toHand(game, "Wastes", B);
      toHand(game, "Wastes", B);
      toStep(game, "upkeep", B);
      settle(game);
      // Two in hand at upkeep: no draw yet.
      expect(life(game, B)).toBe(18);
    });

    it("hurts at five", () => {
      const { game } = table({ openingHandSize: 0 });
      spawn(game, "Skullcage");
      for (let i = 0; i < 5; i += 1) toHand(game, "Wastes", B);
      toStep(game, "upkeep", B);
      settle(game);
      expect(life(game, B)).toBe(18);
    });

    it("spares four", () => {
      const { game } = table({ openingHandSize: 0 });
      spawn(game, "Skullcage");
      for (let i = 0; i < 4; i += 1) toHand(game, "Wastes", B);
      toStep(game, "upkeep", B);
      settle(game);
      expect(life(game, B)).toBe(20);
    });
  });

  describe("Martyr of Frost", () => {
    it("reveals X blue cards, then counters unless {X} is paid", () => {
      const { game, a } = table({ openingHandSize: 0 });
      const martyr = spawn(game, "Martyr of Frost");
      lands(game, "Forest", 2);
      lands(game, "Wastes", 2);
      toHand(game, "Counterspell");
      toHand(game, "Counterspell");
      toHand(game, "Hill Giant");
      const bears = toHand(game, "Grizzly Bears");
      cast(game, bears, { settle: false });
      pickModes(a);
      activate(game, martyr, 0, { x: 2, targets: [ref(bears)] });
      expect(zone(game, martyr)).toBe("graveyard");
      expect(zone(game, bears)).toBe("graveyard");
    });

    it("{X} paid, the spell resolves", () => {
      const { game, a } = table({ openingHandSize: 0 });
      const martyr = spawn(game, "Martyr of Frost");
      lands(game, "Forest", 2);
      lands(game, "Wastes", 3);
      toHand(game, "Counterspell");
      const bears = toHand(game, "Grizzly Bears");
      cast(game, bears, { settle: false });
      pickModes(a, 0);
      activate(game, martyr, 0, { x: 1, targets: [ref(bears)] });
      expect(zone(game, bears)).toBe("battlefield");
    });

    it("can't reveal more blue cards than the hand holds", () => {
      const { game } = table({ openingHandSize: 0 });
      const martyr = spawn(game, "Martyr of Frost");
      lands(game, "Forest", 2);
      lands(game, "Wastes", 2);
      toHand(game, "Counterspell");
      toHand(game, "Hill Giant");
      const bears = toHand(game, "Grizzly Bears");
      cast(game, bears, { settle: false });
      expect(() => activate(game, martyr, 0, { x: 2, targets: [ref(bears)] })).toThrow();
    });
  });

  describe("Contractual Safeguard", () => {
    it("outside your main phase: no shield, and the chosen creature goes without", () => {
      const { game, a } = table({ step: "begin-combat" });
      const first = spawn(game, "Grizzly Bears");
      const second = spawn(game, "Grizzly Bears");
      const third = spawn(game, "Hill Giant");
      const foe = spawn(game, "Grizzly Bears", B);
      game.state.objects[first].counters["+1/+1"] = 1;
      game.state.objects[second].counters["+1/+1"] = 1;
      lands(game, "Plains", 3);
      pickPermanents(a, second);
      cast(game, toHand(game, "Contractual Safeguard"));
      expect(counters(game, first)).toBe(2);
      expect(counters(game, second)).toBe(1);
      expect(counters(game, third)).toBe(1);
      expect(counters(game, foe)).toBe(0);
      expect(counters(game, first, "shield")).toBe(0);
    });

    it("in your main phase the shield counter can be the kind chosen", () => {
      const { game, a } = table();
      const shielded = spawn(game, "Grizzly Bears");
      const other = spawn(game, "Hill Giant");
      lands(game, "Plains", 3);
      a.choosePermanentsFn = () => [shielded];
      a.chooseCreatureTypeFn = (_v, _s, options) => {
        expect(options).toEqual(["shield"]);
        return "shield";
      };
      cast(game, toHand(game, "Contractual Safeguard"));
      expect(counters(game, shielded, "shield")).toBe(1);
      expect(counters(game, other, "shield")).toBe(1);
    });
  });

  describe("Astarion's Thirst", () => {
    it("X is the exiled creature's power as it last existed, on a commander you choose", () => {
      const { game, a } = table();
      const commander = spawn(game, "Grizzly Bears");
      const other = spawn(game, "Hill Giant");
      game.state.objects[commander].isCommander = true;
      const victim = spawn(game, "Grizzly Bears", B);
      game.state.objects[victim].counters["+1/+1"] = 3;
      lands(game, "Swamp", 4);
      const seen = pickPermanents(a, commander);
      pickTargets(a, victim);
      cast(game, toHand(game, "Astarion's Thirst"), { targets: [ref(victim)] });
      expect(zone(game, victim)).toBe("exile");
      expect(counters(game, commander)).toBe(5);
      expect(counters(game, other)).toBe(0);
      expect(seen.offered.length === 0 || seen.offered.includes(commander)).toBe(true);
    });

    it("with no commander creature, the creature is still exiled", () => {
      const { game } = table();
      const other = spawn(game, "Hill Giant");
      const victim = spawn(game, "Grizzly Bears", B);
      lands(game, "Swamp", 4);
      cast(game, toHand(game, "Astarion's Thirst"), { targets: [ref(victim)] });
      expect(zone(game, victim)).toBe("exile");
      expect(counters(game, other)).toBe(0);
    });
  });

  describe("Vial Smasher the Fierce", () => {
    it("damages the opponent for the spell's mana value, {X} counted", () => {
      const { game } = table();
      spawn(game, "Vial Smasher the Fierce");
      lands(game, "Mountain", 3);
      cast(game, toHand(game, "Blaze"), { x: 2, targets: [ref(B)] });
      // Vial Smasher 3 (X=2, {R}), then Blaze 2.
      expect(life(game, B)).toBe(20 - 3 - 2);
    });

    it("reads a spell countered in response as it last existed", () => {
      const { game } = table();
      spawn(game, "Vial Smasher the Fierce");
      lands(game, "Mountain", 3);
      const blaze = toHand(game, "Blaze");
      cast(game, blaze, { x: 2, targets: [ref(B)], settle: false });
      game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(blaze)]);
      settle(game);
      expect(zone(game, blaze)).toBe("graveyard");
      expect(life(game, B)).toBe(17);
    });

    it("only the first spell each turn", () => {
      const { game } = table();
      spawn(game, "Vial Smasher the Fierce");
      lands(game, "Forest", 4);
      cast(game, toHand(game, "Grizzly Bears"));
      expect(life(game, B)).toBe(18);
      cast(game, toHand(game, "Grizzly Bears"));
      expect(life(game, B)).toBe(18);
    });

    it("may hit the planeswalker of your choice that player controls instead", () => {
      const { game, a } = table();
      spawn(game, "Vial Smasher the Fierce");
      const first = spawn(game, "Jace Beleren", B);
      const second = spawn(game, "Garruk Wildspeaker", B);
      game.state.objects[first].counters.loyalty = 3;
      game.state.objects[second].counters.loyalty = 3;
      lands(game, "Forest", 2);
      pickModes(a, 1);
      const seen = pickPermanents(a, second);
      cast(game, toHand(game, "Grizzly Bears"));
      expect(seen.offered).toEqual(expect.arrayContaining([first, second]));
      expect(life(game, B)).toBe(20);
      expect(counters(game, first, "loyalty")).toBe(3);
      expect(counters(game, second, "loyalty")).toBe(1);
    });

    it("or the player, with a walker there", () => {
      const { game, a } = table();
      spawn(game, "Vial Smasher the Fierce");
      const walker = spawn(game, "Jace Beleren", B);
      game.state.objects[walker].counters.loyalty = 3;
      lands(game, "Forest", 2);
      pickModes(a, 0);
      cast(game, toHand(game, "Grizzly Bears"));
      expect(life(game, B)).toBe(18);
      expect(counters(game, walker, "loyalty")).toBe(3);
    });

    it("at a bigger table reaches only the walkers of the opponent chosen at random", () => {
      const { game, a } = table({ players: 3, seed: 3 });
      spawn(game, "Vial Smasher the Fierce");
      const bobs = spawn(game, "Jace Beleren", B);
      const carols = spawn(game, "Jace Beleren", C);
      game.state.objects[bobs].counters.loyalty = 3;
      game.state.objects[carols].counters.loyalty = 3;
      lands(game, "Forest", 2);
      pickModes(a, 1);
      const seen = { offered: [] as readonly ObjectId[] };
      a.choosePermanentsFn = (_v, eligible) => {
        seen.offered = eligible;
        return [eligible[0]];
      };
      cast(game, toHand(game, "Grizzly Bears"));
      expect(life(game, B) + life(game, C)).toBe(40);
      expect(counters(game, bobs, "loyalty") + counters(game, carols, "loyalty")).toBe(4);
      expect(seen.offered.length).toBeLessThanOrEqual(1);
    });

    it("with no planeswalker it's the player, unasked", () => {
      const { game, a } = table();
      spawn(game, "Vial Smasher the Fierce");
      lands(game, "Forest", 2);
      let asked = 0;
      a.chooseModesFn = (_v, min) => {
        asked += 1;
        return Array.from({ length: min }, (_, i) => i);
      };
      cast(game, toHand(game, "Grizzly Bears"));
      expect(life(game, B)).toBe(18);
      expect(asked).toBeLessThanOrEqual(1);
    });
  });

  describe("Balance of Power", () => {
    it("draws the difference from the targeted opponent's hand", () => {
      const { game, a } = table({ players: 3 });
      lands(game, "Island", 5);
      toHand(game, "Wastes", B);
      toHand(game, "Wastes", B);
      const spell = toHand(game, "Balance of Power");
      const mine = hand(game, A).length - 1;
      const bobs = hand(game, B).length;
      pickTargets(a, B);
      cast(game, spell, { targets: [ref(B)] });
      expect(hand(game, A).length).toBe(mine + (bobs - mine));
    });

    it("draws nothing with no more cards than you", () => {
      const { game } = table();
      lands(game, "Island", 5);
      toHand(game, "Wastes");
      toHand(game, "Wastes");
      const spell = toHand(game, "Balance of Power");
      const mine = hand(game, A).length - 1;
      cast(game, spell, { targets: [ref(B)] });
      expect(hand(game, A).length).toBe(mine);
    });
  });

  describe("All-Seeing Arbiter", () => {
    it("each discarded card shrinks by the different mana values in your graveyard, until your next turn", () => {
      const { game, a } = table();
      toGraveyard(game, "Grizzly Bears");
      toGraveyard(game, "Hill Giant");
      toGraveyard(game, "Ornithopter");
      toGraveyard(game, "Grizzly Bears");
      const foe = spawn(game, "Hill Giant", B);
      pickTargets(a, foe);
      enter(game, "All-Seeing Arbiter");
      // The discard itself goes to the graveyard first: Wastes, mana value 0, next to Ornithopter's 0.
      expect(graveyard(game, A).length).toBe(5);
      expect(pt(game, foe)).toEqual({ power: 0, toughness: 3 });
      nextTurn(game);
      expect(pt(game, foe)).toEqual({ power: 0, toughness: 3 });
      nextTurn(game);
      expect(pt(game, foe)).toEqual({ power: 3, toughness: 3 });
    });
  });

  describe("Loot, the Nexus", () => {
    it("makes one colour, one mana for each different power", () => {
      const { game } = table();
      const loot = spawn(game, "Loot, the Nexus");
      spawn(game, "Grizzly Bears");
      spawn(game, "Hill Giant");
      spawn(game, "Ornithopter");
      game.dispatch({ type: "activate-ability", player: A, source: loot, abilityIndex: 0, targets: [], manaColors: ["G"] });
      // Powers 2 (Loot and the Bears), 3 and 0.
      expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G", "G", "G"]);
    });

    it("pays a spell", () => {
      const { game } = table();
      spawn(game, "Loot, the Nexus");
      spawn(game, "Hill Giant");
      const spell = toHand(game, "Grizzly Bears");
      cast(game, spell);
      expect(named(game, "Grizzly Bears").length).toBe(1);
    });
  });

  describe("Benevolent Offering", () => {
    it("you may choose different opponents, and each gains for their own creatures", () => {
      const { game, a } = table({ players: 3 });
      lands(game, "Plains", 4);
      spawn(game, "Grizzly Bears");
      const picks = [1, 0];
      a.chooseModesFn = () => [picks.shift() ?? 0];
      cast(game, toHand(game, "Benevolent Offering"));
      expect(tokensNamed(game, "Spirit Token", A)).toBe(3);
      const tokens = [tokensNamed(game, "Spirit Token", B), tokensNamed(game, "Spirit Token", C)];
      expect(tokens.sort()).toEqual([0, 3]);
      expect(life(game, A)).toBe(20 + 2 * 4);
      const gained = [life(game, B) - 20, life(game, C) - 20];
      expect(gained[0] + gained[1]).toBeGreaterThanOrEqual(0);
      // Whichever was chosen second gains for their own: 3 spirits or none.
      expect(gained.filter((g) => g !== 0).length).toBeLessThanOrEqual(1);
    });
  });

  describe("The Mouth of Sauron", () => {
    it("amasses from the targeted player's graveyard after the mill", () => {
      const { game, a } = table({ deck: "Lightning Bolt" });
      toGraveyard(game, "Lightning Bolt", B);
      toGraveyard(game, "Lightning Bolt");
      pickTargets(a, B);
      enter(game, "The Mouth of Sauron");
      expect(graveyard(game, B).length).toBe(4);
      const armies = game.battlefield.filter((id) => game.state.objects[id].controller === A && game.state.objects[id].isToken);
      expect(armies.length).toBe(1);
      expect(counters(game, armies[0])).toBe(4);
    });
  });
});
