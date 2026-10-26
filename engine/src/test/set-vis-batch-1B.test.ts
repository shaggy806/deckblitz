/**
 * Visions (VIS; B172), group B. One test per card whose behaviour is more than
 * a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
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
  pickModes,
  pickPermanents,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const priorityIn = (game: Game, step: Game["state"]["turn"]["step"], holder: typeof A): void =>
  game.advanceUntil((s) => s.turn.step === step && s.priority.holder === holder);

describe("Femeref Enchantress", () => {
  it("draws when any player's enchantment goes to a graveyard from the battlefield", () => {
    const { game } = table();
    spawn(game, "Femeref Enchantress");
    const anthem = spawn(game, "Glorious Anthem", B);
    const before = hand(game, A).length;
    destroy(game, anthem);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Brood of Cockroaches", () => {
  it("at the next end step, you lose 1 life and it returns to your hand", () => {
    const { game } = table();
    const brood = spawn(game, "Brood of Cockroaches");
    destroy(game, brood);
    expect(graveyard(game, A)).toContain(brood);
    expect(life(game, A)).toBe(20);
    priorityIn(game, "end", A);
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(hand(game, A)).toContain(brood);
  });
});

describe("Magma Mine", () => {
  it("deals damage equal to its pressure counters as it's sacrificed", () => {
    const { game } = table();
    const mine = spawn(game, "Magma Mine");
    lands(game, "Wastes", 8);
    activate(game, mine, 0);
    activate(game, mine, 0);
    expect(counters(game, mine, "pressure")).toBe(2);
    activate(game, mine, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Diamond Kaleidoscope", () => {
  it("makes a 0/1 Prism and sacrifices a Prism token for one mana", () => {
    const { game } = table();
    const scope = spawn(game, "Diamond Kaleidoscope");
    lands(game, "Wastes", 3);
    activate(game, scope, 0);
    expect(tokensNamed(game, "Prism Token", A)).toBe(1);
    const prism = named(game, "Prism Token", A)[0];
    game.dispatch({ type: "activate-ability", player: A, source: scope, abilityIndex: 1, targets: [], sacrifice: prism });
    settle(game);
    expect(tokensNamed(game, "Prism Token", A)).toBe(0);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});

describe("Simoon", () => {
  it("deals 1 damage to each creature the target opponent controls, not yours", () => {
    const { game } = table();
    const mine = spawn(game, "Youthful Knight");
    const theirs = spawn(game, "Youthful Knight", B);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Simoon"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Pillar Tombs of Aku", () => {
  it("a player who doesn't sacrifice a creature loses 5 life and you sacrifice it", () => {
    const { game, b } = table();
    const tombs = spawn(game, "Pillar Tombs of Aku");
    spawn(game, "Grizzly Bears", B);
    pickModes(b);
    nextTurn(game, "draw");
    expect(life(game, B)).toBe(15);
    expect(zone(game, tombs)).toBe("graveyard");
  });

  it("a player who sacrifices a creature keeps their life and it stays", () => {
    const { game, b } = table();
    const tombs = spawn(game, "Pillar Tombs of Aku");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    pickPermanents(b, bears);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(zone(game, tombs)).toBe("battlefield");
  });
});

describe("Bull Elephant", () => {
  it("returns two Forests, or is sacrificed", () => {
    const { game, a } = table();
    const forests = lands(game, "Forest", 2);
    pickModes(a, 0);
    pickPermanents(a, ...forests);
    const elephant = enter(game, "Bull Elephant");
    expect(zone(game, elephant)).toBe("battlefield");
    expect(forests.map((f) => zone(game, f))).toEqual(["hand", "hand"]);
  });

  it("is sacrificed with only one Forest to return", () => {
    const { game, a } = table();
    const [forest] = lands(game, "Forest", 1);
    pickModes(a, 0);
    const elephant = enter(game, "Bull Elephant");
    expect(zone(game, elephant)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
  });
});

describe("Talruum Champion", () => {
  it("a creature blocking it loses first strike until end of turn", () => {
    const { game, a, b } = table();
    const champion = spawn(game, "Talruum Champion");
    const knight = spawn(game, "Youthful Knight", B);
    a.declareAttackersFn = () => [{ attacker: champion, defender: B }];
    b.declareBlockersFn = () => [{ blocker: knight, attacker: champion }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && quiet(s));
    expect(keywords(game, knight).has("first-strike")).toBe(false);
    expect(keywords(game, champion).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, knight).has("first-strike")).toBe(true);
  });
});
