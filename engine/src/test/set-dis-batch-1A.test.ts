import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const emptyHand = (game: Game, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "discard-hand", who: "you" }, []);
  settle(game);
};

describe("Omnibian", () => {
  it("makes the target a 3/3 Frog, counters still applying", () => {
    const { game } = table();
    const omnibian = spawn(game, "Omnibian");
    const angel = spawn(game, "Serra Angel", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(angel)]);
    activate(game, omnibian, 0, { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, angel)).toEqual(["Frog"]);
    expect(keywords(game, angel).has("flying")).toBe(true);
  });
});

describe("Walking Archive", () => {
  it("enters with a counter and makes each player draw at their upkeep", () => {
    const { game } = table();
    const archive = enter(game, "Walking Archive");
    expect(counters(game, archive)).toBe(1);
    const before = hand(game, B).length;
    nextTurn(game);
    // Bob's draw step and the Archive's upkeep draw.
    expect(hand(game, B).length).toBe(before + 2);
  });
});

describe("Sprouting Phytohydra", () => {
  it("may copy itself when dealt damage, even if the damage kills it", () => {
    const { game, a } = table();
    const hydra = spawn(game, "Sprouting Phytohydra");
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(hydra)]);
    settle(game);
    expect(zone(game, hydra)).toBe("graveyard");
    expect(tokensNamed(game, "Sprouting Phytohydra", A)).toBe(1);
  });
});

describe("Plaxmanta", () => {
  it("is sacrificed unless {G} was spent to cast it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const entered = enter(game, "Plaxmanta");
    expect(zone(game, entered)).toBe("graveyard");
    expect(keywords(game, bears).has("shroud")).toBe(true);

    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const plax = toHand(game, "Plaxmanta");
    cast(game, plax);
    expect(zone(game, plax)).toBe("battlefield");
  });
});

describe("Squealing Devil", () => {
  it("pays X for +X/+0 and stays only if {B} was spent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    pickTargets(a, bears);
    const devil = toHand(game, "Squealing Devil");
    cast(game, devil, { settle: false });
    // Mana for X only once the Devil's own cost is paid ({B} on its cost).
    lands(game, "Wastes", 2);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(zone(game, devil)).toBe("battlefield");
  });

  it("is sacrificed when it enters without being cast", () => {
    const { game, a } = table();
    pickModes(a);
    const devil = enter(game, "Squealing Devil");
    expect(zone(game, devil)).toBe("graveyard");
  });
});

describe("Taste for Mayhem", () => {
  it("gives +2/+0, and +4/+0 while its controller has no cards in hand", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Taste for Mayhem"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    emptyHand(game);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 2 });
  });
});

describe("Aethermage's Touch", () => {
  it("puts a revealed creature onto the battlefield, returning it at your end step", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : eligible);
    cast(game, toHand(game, "Aethermage's Touch"));
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Jagged Poppet", () => {
  it("makes you discard as many cards as the damage dealt to it", () => {
    const { game } = table();
    const poppet = spawn(game, "Jagged Poppet");
    const before = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(poppet)]);
    settle(game);
    expect(hand(game, A).length).toBe(before - 2);
  });

  it("hellbent: the damaged player discards cards equal to the combat damage", () => {
    const { game, a } = table();
    const poppet = spawn(game, "Jagged Poppet");
    emptyHand(game);
    const before = hand(game, B).length;
    attack(game, a, [poppet]);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 3);
  });
});

describe("Helium Squirter", () => {
  it("gives flying only to a creature with a +1/+1 counter", () => {
    const { game } = table();
    const squirter = enter(game, "Helium Squirter");
    expect(counters(game, squirter)).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const refusal = game.canDispatch({
      type: "activate-ability",
      player: A,
      source: squirter,
      abilityIndex: 0,
      targets: [ref(bears)],
    });
    expect(refusal).not.toBeNull();
    activate(game, squirter, 0, { targets: [ref(squirter)] });
    expect(keywords(game, squirter).has("flying")).toBe(true);
  });
});

describe("Evolution Vat", () => {
  it("taps the creature, adds a counter, and grants the doubling ability", () => {
    const { game } = table();
    const vat = spawn(game, "Evolution Vat");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 5);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    activate(game, vat, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears)).toBe(2);
    activate(game, bears, 0);
    expect(counters(game, bears)).toBe(4);
  });
});

describe("Gobhobbler Rats", () => {
  it("is 3/2 with a regeneration ability only while hellbent", () => {
    const { game } = table();
    const rats = spawn(game, "Gobhobbler Rats");
    expect(pt(game, rats)).toEqual({ power: 2, toughness: 2 });
    emptyHand(game);
    expect(pt(game, rats)).toEqual({ power: 3, toughness: 2 });
    lands(game, "Swamp", 1);
    activate(game, rats, 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(rats)]);
    settle(game);
    expect(zone(game, rats)).toBe("battlefield");
  });
});

describe("Enigma Eidolon", () => {
  it("may return from the graveyard when you cast a multicolored spell", () => {
    const { game, a } = table();
    const eidolon = toGraveyard(game, "Enigma Eidolon");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Gobhobbler Rats"));
    expect(zone(game, eidolon)).toBe("hand");
  });

  it("mills three when sacrificed", () => {
    const { game, a } = table();
    const eidolon = spawn(game, "Enigma Eidolon");
    lands(game, "Island", 1);
    pickTargets(a, B);
    game.dispatch({ type: "activate-ability", player: A, source: eidolon, abilityIndex: 0, targets: [ref(B)], sacrifice: eidolon } as never);
    settle(game);
    expect(zone(game, eidolon)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(3);
  });
});

describe("Cackling Flames", () => {
  it("deals 3, or 5 when you have no cards in hand", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Cackling Flames"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    emptyHand(game);
    cast(game, toHand(game, "Cackling Flames"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
  });
});

describe("Vigean Intuition", () => {
  it("puts the revealed cards of the chosen type into hand and the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    const bears2 = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    pickModes(a, 2);
    cast(game, toHand(game, "Vigean Intuition"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bears2)).toBe("hand");
    expect(graveyard(game, A).filter((id) => game.state.objects[id].cardName === "Wastes").length).toBe(2);
    expect(named(game, "Grizzly Bears").length).toBe(0);
  });
});
