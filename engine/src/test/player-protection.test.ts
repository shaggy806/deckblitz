/**
 * A player's protection from a quality — `StaticAbility.playerProtection`
 * (rule 702.16): no spell with it, nor ability from a source with it, can
 * target the player (702.16b); no Aura with it can enchant them, and one
 * already on them falls off (702.16c); damage from a source with it is
 * prevented (702.16e). Serra's Emissary's "you and creatures you control
 * have protection from the chosen card type" (`chosenCardType`, the
 * creatures' half on `protection`), Runed Halo's "from the chosen card name"
 * (a filter read off its own permanent).
 */
import { describe, expect, it } from "vitest";
import { CARD_TYPE_CHOICES } from "../effects.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  lands,
  life,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Serra's Emissary", () => {
  it("offers every card type as it enters and records the one chosen", () => {
    const { game, a } = table();
    const offered: string[][] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered.push([...options]);
      return "instant";
    };
    lands(game, "Plains", 7);
    const emissary = toHand(game, "Serra's Emissary");
    cast(game, emissary);
    expect(offered).toEqual([[...CARD_TYPE_CHOICES]]);
    expect(game.state.objects[emissary].chosenOnEnter).toBe("instant");
  });

  it("instant: no instant can target you or your creatures; another player still can be", () => {
    const { game } = table();
    const emissary = spawn(game, "Serra's Emissary");
    game.state.objects[emissary].chosenOnEnter = "instant";
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3, B);
    game.state.priority.holder = B;
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] })).toThrow();
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(bears)] })).toThrow();
    // An instant can still target someone without it.
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });

  it("creature: combat damage from creatures to you is prevented, and abilities of creatures can't target you", () => {
    const { game, b } = table();
    const emissary = spawn(game, "Serra's Emissary");
    game.state.objects[emissary].chosenOnEnter = "creature";
    const goblin = spawn(game, "Raging Goblin", B);
    attack(game, b, [goblin], A);
    expect(life(game, A)).toBe(20);
  });

  it("creature: a creature's ability can't target you, a noncreature source's can", () => {
    const { game } = table();
    const emissary = spawn(game, "Serra's Emissary");
    game.state.objects[emissary].chosenOnEnter = "creature";
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    expect(() => activate(game, pyromancer, 0, { targets: [ref(A)] })).toThrow();
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });

  it("protects only its controller: another player is still damaged", () => {
    const { game, a } = table({ players: 3 });
    const emissary = spawn(game, "Serra's Emissary", B);
    game.state.objects[emissary].chosenOnEnter = "creature";
    const goblin = spawn(game, "Raging Goblin");
    attack(game, a, [goblin], C);
    expect(life(game, C)).toBe(19);
  });

  it("enchantment: a Curse can't enchant you; it can enchant an opponent", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const emissary = spawn(game, "Serra's Emissary");
    game.state.objects[emissary].chosenOnEnter = "enchantment";
    expect(() => cast(game, toHand(game, "Curse of Opulence"), { targets: [ref(A)] })).toThrow();
    const curse = toHand(game, "Curse of Opulence");
    cast(game, curse, { targets: [ref(B)] });
    expect(zone(game, curse)).toBe("battlefield");
  });

  it("enchantment: a Curse already enchanting you is put into the graveyard once you have it", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const curse = toHand(game, "Curse of Opulence");
    cast(game, curse, { targets: [ref(A)] });
    expect(zone(game, curse)).toBe("battlefield");
    const emissary = spawn(game, "Serra's Emissary");
    game.state.objects[emissary].chosenOnEnter = "enchantment";
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(zone(game, curse)).toBe("graveyard");
  });
});

describe("Runed Halo", () => {
  it("stops anything with the chosen name targeting or damaging you, nothing else", () => {
    const { game } = table();
    const halo = spawn(game, "Runed Halo");
    game.state.objects[halo].chosenNames = ["Shock"];
    lands(game, "Mountain", 3, B);
    game.state.priority.holder = B;
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] })).toThrow();
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
  });
});
